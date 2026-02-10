// ============================================
// 2. Firebase Admin設定 (lib/firebase-admin.js)
// ============================================
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore"; // ← サーバー側Firestore

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return { auth: getAuth(), db: getFirestore() };
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) throw new Error("FIREBASE_PRIVATE_KEY is not set");

  let formattedKey = privateKey;
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.slice(1, -1);
  }
  formattedKey = formattedKey.replace(/\\n/g, "\n");

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    }),
  });

  return { auth: getAuth(), db: getFirestore() };
}

const admin = initializeFirebaseAdmin();
export const adminAuth = admin.auth;
export const adminDb = admin.db;
