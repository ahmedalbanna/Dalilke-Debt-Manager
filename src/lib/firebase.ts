import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

// Check if running in a Firebase Hosting environment or if service account is provided
// For App Hosting, initializeApp() without arguments should work.
// For local development, you might need a service account key.
// const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (getApps().length === 0) {
  // if (serviceAccountPath) {
  //   initializeApp({
  //     credential: cert(serviceAccountPath),
  //   });
  // } else {
    // This should work in Firebase App Hosting environment
    initializeApp();
  // }
}

const db = getFirestore();

export { db, FieldValue, Timestamp };
