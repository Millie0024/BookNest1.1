// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE THIS WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAn-1912BAipupmtH8HhynD5EIK1DXhvmo",
    authDomain: "booknest-app-e4773.firebaseapp.com",
    projectId: "booknest-app-e4773",
    storageBucket: "booknest-app-e4773.firebasestorage.app",
    messagingSenderId: "363328107409",
    appId: "1:363328107409:web:9419b01ed1d2dd6ccaa030",
    measurementId: "G-PSNZFWVGRQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
