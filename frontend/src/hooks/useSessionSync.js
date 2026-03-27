import { useEffect, useContext, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useSessionSync = (currentSessionId, deviceId) => {
    const { user, logout } = useContext(AuthContext);
    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    // 1. Multi-Device Firestore Real-time Sync
    useEffect(() => {
        if (!user || !db || !currentSessionId) return;

        const userId = user._id || user.id;
        const sessionDocRef = doc(db, 'user_sessions', userId);

        const unsubscribe = onSnapshot(sessionDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // IF isActive == false OR sessionId mismatch
                if (data.isActive === false || data.sessionId !== currentSessionId) {
                    console.warn("Session invalidated strictly by remote source or another login. Auto-logging out.");
                    handleForceLogout();
                }
            }
        });

        return () => unsubscribe();
    }, [user, currentSessionId]);

    // 2. Tab Sync & External Tab Auto-close tracking
    useEffect(() => {
        if (!window.externalTabs) {
            window.externalTabs = [];
        }

        const authChannel = new BroadcastChannel('auth_sync');
        authChannel.onmessage = (event) => {
            if (event.data === 'SESSION_TERMINATED') {
                handleForceLogout();
            }
        };

        // External Tabs Cross-communication
        const extChannel = new BroadcastChannel('external_tabs_sync');
        extChannel.onmessage = (event) => {
            if (event.data === 'SESSION_TERMINATED') {
                // If THIS is the external tab (hypothetical), it redirects to /session-expired
                // But within the Hub logic, the Hub is the master.
            }
        };

        const handleBeforeUnload = () => {
            // "ON MAIN TAB CLOSE: Use beforeunload event: -> close all external tabs -> update Firestore isActive = false"
            closeExternalTabs();

            const currentUser = userRef.current;
            if (currentUser && db) {
                const uid = currentUser._id || currentUser.id;
                try {
                    // Fire-and-forget sync
                    updateDoc(doc(db, 'user_sessions', uid), { isActive: false }).catch(() => null);
                } catch (e) { }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        const handleManualLogout = () => {
            handleBeforeUnload(); // Updates firestore and closes external tabs
            const authChannel = new BroadcastChannel('auth_sync');
            authChannel.postMessage('SESSION_TERMINATED');
            authChannel.close();
        };
        window.addEventListener('manual_logout', handleManualLogout);

        return () => {
            authChannel.close();
            extChannel.close();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('manual_logout', handleManualLogout);
        };
    }, []);

    const closeExternalTabs = () => {
        // A. OPENING: Use window.open(), store reference in window.externalTabs = []
        // C. ON LOGOUT OR SESSION TERMINATION: Loop through all tabs: tab.close()
        if (window.externalTabs && window.externalTabs.length > 0) {
            window.externalTabs.forEach(tab => {
                if (tab && !tab.closed) {
                    try {
                        tab.close();
                    } catch (e) {
                        // F. FAIL-SAFE: If blocked, BroadcastChannel allows them to redirect themselves
                        const extChannel = new BroadcastChannel('external_tabs_sync');
                        extChannel.postMessage('SESSION_TERMINATED');
                        extChannel.close();
                    }
                }
            });
            // Clean up array
            window.externalTabs = window.externalTabs.filter(t => t && !t.closed);
        }

        // Secondary broadcast signal as per "E. CROSS-TAB COMMUNICATION"
        const ec = new BroadcastChannel('external_tabs_sync');
        ec.postMessage('SESSION_TERMINATED');
        ec.close();
    };

    const handleForceLogout = () => {
        closeExternalTabs();
        if (logout) {
            logout(false); // Make sure AuthContext knows to wipe the JWT token
        }
    };
};
