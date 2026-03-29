<<<<<<< HEAD
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDWCeZSB2brEcQbZs2Yr6aG8I8Y3B2PTbY",
  authDomain: "ai-student-hub.firebaseapp.com",
  projectId: "ai-student-hub",
  storageBucket: "ai-student-hub.firebasestorage.app",
  messagingSenderId: "301731574122",
  appId: "1:301731574122:web:df7d2873f3e65467817513",
  measurementId: "G-YH0Y0EKNSC"
};

const app = initializeApp(firebaseConfig);

export default app;
=======
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
>>>>>>> 70f6487315ffb4abfc0e2702cd18e56bbd3189d9
