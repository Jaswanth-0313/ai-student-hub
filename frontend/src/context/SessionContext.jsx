import React, { createContext, useContext, useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useSessionSync } from '../hooks/useSessionSync';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId'));

    const [deviceId] = useState(() => {
        let id = localStorage.getItem('deviceId');
        if (!id) {
            id = uuidv4();
            localStorage.setItem('deviceId', id);
        }
        return id;
    });

    // Activate the unified sync controls (Firestore Multi-device + Tab Sync)
    useSessionSync(sessionId, deviceId);

    // Called manually after a successful login
    const initFirebaseSession = async (user) => {
        if (!user) return;

        const newSessionId = uuidv4();
        setSessionId(newSessionId);
        localStorage.setItem('sessionId', newSessionId);

        // Don't let session storage block the entire UI if Firestore is slow/down
        try {
            if (db && user) {
                const userId = user.uid || user._id || user.id;
                console.log("📝 Writing session to Firestore for userId:", userId);

                // Add a timeout if possible or just handle as fire-and-forget-ish
                await setDoc(doc(db, 'user_sessions', userId), {
                    userId,
                    sessionId: newSessionId,
                    deviceId: deviceId,
                    isActive: true,
                    lastSeen: Date.now()
                });
                console.log("💾 Firestore Session Document Updated");
            }
        } catch (e) {
            console.error("❌ Failed to store Session to Firestore:", e);
            // Non-critical error, don't throw
        }
    };

    // Called gracefully on user-initiated logout
    const terminateFirebaseSession = async (userId) => {
        try {
            if (db && userId) {
                await updateDoc(doc(db, 'user_sessions', userId), {
                    isActive: false
                });
            }
        } catch (e) {
            console.warn("Could not mark session inactive in Firestore:", e);
        }

        setSessionId(null);
        localStorage.removeItem('sessionId');

        // Notify same device tabs
        const channel = new BroadcastChannel('auth_sync');
        channel.postMessage('SESSION_TERMINATED');
        channel.close();
    };

    return (
        <SessionContext.Provider value={{ sessionId, deviceId, initFirebaseSession, terminateFirebaseSession }}>
            {children}
        </SessionContext.Provider>
    );
};
