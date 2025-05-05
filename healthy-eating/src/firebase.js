import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAFK173WuCM3ZrJhwEWGZLgltSOz9yJN9M",
  authDomain: "healthyeatingapp-60d99.firebaseapp.com",
  projectId: "healthyeatingapp-60d99",
  storageBucket: "healthyeatingapp-60d99.appspot.com",
  messagingSenderId: "891527215548",
  appId: "1:891527215548:web:6bc92526bc20498ac393b9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);