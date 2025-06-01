
import admin from 'firebase-admin';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore as getFirestoreAdmin, FieldValue as AdminFieldValue, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

let dbInstance: admin.firestore.Firestore;

function getDb() {
  if (!dbInstance) {
    if (getApps().length === 0) {
      initializeApp();
    }
    dbInstance = getFirestoreAdmin();
  }
  return dbInstance;
}

// Re-export FieldValue and Timestamp for convenience, ensuring they come from firebase-admin/firestore
const FieldValue = AdminFieldValue;
const Timestamp = AdminTimestamp;

export { getDb, FieldValue, Timestamp };
