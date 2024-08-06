// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCu0qQu1SV8yXClg3JuEENErOeGNgXgGQY",
  authDomain: "inventory-tracker-59e0b.firebaseapp.com",
  projectId: "inventory-tracker-59e0b",
  storageBucket: "inventory-tracker-59e0b.appspot.com",
  messagingSenderId: "576756509179",
  appId: "1:576756509179:web:013e3268ac9674ed61c35e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);