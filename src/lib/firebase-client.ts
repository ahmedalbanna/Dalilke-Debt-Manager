
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Ensure your Firestore/Storage security rules are properly configured.
const firebaseConfig = {
  apiKey: "AIzaSyAqVjtMgDDbcddnthnw11nnqoGDu5M7Bp8",
  authDomain: "studio-diav4.firebaseapp.com",
  projectId: "studio-diav4",
  storageBucket: "studio-diav4.firebasestorage.app",
  messagingSenderId: "108849730654",
  appId: "1:108849730654:web:22fba33e5d5cda28d7d0cf"
};

let firebaseClientApp: FirebaseApp;

// Initialize Firebase
if (!getApps().length) {
  firebaseClientApp = initializeApp(firebaseConfig);
} else {
  firebaseClientApp = getApp(); // If already initialized, get the existing app
}

export { firebaseClientApp };
