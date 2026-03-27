import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// --- DEBUG LOGS (Temporary) ---
console.log("🔥 FIREBASE CONFIG:", firebaseConfig);

// Validate Config
Object.keys(firebaseConfig).forEach(key => {
    if (!firebaseConfig[key]) {
        console.error(`❌ MISSING ENV VARIABLE: ${key} is undefined! Check your .env flow.`);
    }
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
