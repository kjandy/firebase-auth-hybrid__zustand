// ============================================
// 0. Firestore のセキュリティルール
//     (Firebase Console で設定)
// ============================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/(default)/documents {
    // posts コレクション
    match /posts/{postId} {
      // 読み取り: 自分の投稿のみ
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // 作成: 認証済みユーザー・自分のuserIdのみ
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // 削除: 自分の投稿のみ
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
      // 更新: 自分の投稿のみ・userIdは変更不可
      allow update: if request.auth != null && resource.data.userId == request.auth.uid && request.resource.data.userId == request.auth.uid;
    }
  }
}
*/

// ============================================
// 1. Firebase Client設定 (lib/firebase.js)
// ============================================
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app); // ← Firestore追加
