// Import the functions you need from the SDKs you need
import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvpFSupAQbeN2ZN6gEN5lSl610HWRiBOE",
  authDomain: "white-byway-374008.firebaseapp.com",
  projectId: "white-byway-374008",
  storageBucket: "white-byway-374008.firebasestorage.app",
  messagingSenderId: "709897966899",
  appId: "1:709897966899:web:162f98f484de7b8c619a46",
  measurementId: "G-MVN7BZM3HT",
} as FirebaseOptions;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const functions = getFunctions(app);

export { app, analytics, functions };
