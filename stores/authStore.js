// ============================================
// 3. Zustand Store (stores/authStore.js)
// 認証状態を管理するための Zustand ストア
// このファイルは、ユーザーの認証状態を管理し、
// サインイン、サインアップ、サインアウトの機能を提供します。
// ============================================
import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const useAuthStore = create((set, get) => ({
  //ユーザーの認証状態を管理するための Zustand ストアを定義しています。
  // 外部イベント（Firebase）から状態を受け取りそのまま set() するため
  // get()はストア内部で現在の状態を取得するための関数
  // ここでは必要ないが、Zustand のルール上引数として受け取る必要がある。

  // --- State ---
  user: null,
  loading: true,
  error: null,

  // --- Actions ---
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // --- Auth Methods ---
  signIn: async (email, password) => {
    try {
      set({ error: null });
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const msg = getAuthErrorMessage(error.code);
      set({ error: msg });
      throw new Error(msg);
    }
  },

  signUp: async (email, password, displayName) => {
    try {
      set({ error: null });
      if (password.length < 6)
        throw new Error("パスワードは6文字以上である必要があります");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // displayName をAuthに保存（メールユーザー用）
      // trim() して空白だけの名前を防止
      if (displayName?.trim()) {
        //  ユーザープロフィールを更新して displayName を保存
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
    } catch (error) {
      const msg = error.message || getAuthErrorMessage(error.code);
      set({ error: msg });
      throw new Error(msg);
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ error: null });
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        const msg = getAuthErrorMessage(error.code);
        set({ error: msg });
        throw new Error(msg);
      }
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      await fetch("/api/auth/signout", { method: "POST" });
      set({ user: null, error: null });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  },

  // --- Session ---

  // クライアント（fetch）が /api/auth/session に HTTP POST を送る
  // Next.js が app/api/auth/session/route.js の POST() を呼び出す
  // POST(request) の request には、HTTPリクエスト情報（body/headers等）が入っている
  // request.json() で idToken を取り出す
  // サーバーで Firebase Admin SDK により idToken を検証（verifyIdToken）
  // 検証OKならセッションCookieを生成（createSessionCookie）
  // cookies().set() により Set-Cookie ヘッダーで httpOnly Cookie を返す
  // ブラウザがCookieを保存し、以後のリクエストで自動送信される

  createSession: async (user) => {
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("Session creation failed:", err);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  },
}));

// --- エラーメッセージ変換 ---
function getAuthErrorMessage(code) {
  const messages = {
    "auth/invalid-email": "メールアドレスの形式が正しくありません",
    "auth/user-not-found": "このメールアドレスは登録されていません",
    "auth/wrong-password": "パスワードが間違っています",
    "auth/invalid-credential": "メールアドレスまたはパスワードが間違っています",
    "auth/email-already-in-use": "このメールアドレスは既に使用されています",
    "auth/weak-password": "パスワードが弱すぎます。6文字以上にしてください",
    "auth/popup-blocked": "ポップアップがブロックされました",
    "auth/operation-not-allowed": "認証が有効になっていません",
    "auth/too-many-requests": "しばらく待ってから再度お試しください",
  };
  return messages[code] || `認証エラー: ${code}`;
}

// --- 認証監視の開始 ---
export function initAuth() {
  // onAuthStateChanged は Firebase Auth の関数
  return onAuthStateChanged(auth, async (user) => {
    const store = useAuthStore.getState(); // getState()はget()と違い、ストアの外側からストアの状態を直接取得するための関数
    store.setUser(user); // ユーザーの状態を更新
    if (user) {
      //IDトークンをサーバーへ送る
      // サーバーが検証する
      // サーバーが session cookieを発行する
      // ブラウザにCookieを返す
      await store.createSession(user);
    }
  });
}

export default useAuthStore;
