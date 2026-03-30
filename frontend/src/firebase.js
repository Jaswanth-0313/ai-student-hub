import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate firebaseConfig keys
Object.keys(firebaseConfig).forEach((key) => {
  if (!firebaseConfig[key]) {
    console.warn(`Firebase env var ${key} is missing`);
  }
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Enable Firebase Auth Persistence (survives browser restart)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase persistence enabled');
  })
  .catch((error) => {
    console.error('❌ Failed to set persistence:', error);
  });

export default app;
