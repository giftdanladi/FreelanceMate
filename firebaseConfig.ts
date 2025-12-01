// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVHDFgoU_ihWrk6u_N05vsjcFAr5pQBtk",
  authDomain: "freelancemate-e2a99.firebaseapp.com",
  projectId: "freelancemate-e2a99",
  storageBucket: "freelancemate-e2a99.firebasestorage.app",
  messagingSenderId: "689670897952",
  appId: "1:689670897952:web:92e25ecfe9efb832859745"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
