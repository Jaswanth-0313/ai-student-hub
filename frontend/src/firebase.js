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
