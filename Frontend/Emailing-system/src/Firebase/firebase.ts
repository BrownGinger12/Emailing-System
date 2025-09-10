// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4hHIueNM3E9L_Sh75WLwLzdlByZvjmgk",
  authDomain: "emailing-auth-61f6f.firebaseapp.com",
  projectId: "emailing-auth-61f6f",
  storageBucket: "emailing-auth-61f6f.firebasestorage.app",
  messagingSenderId: "329457826391",
  appId: "1:329457826391:web:a5660715f2a8b4a5900112",
  measurementId: "G-QSN9RYPX16",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
