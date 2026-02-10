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
  // ブラウザが HTTP リクエストを作る
  // Next.js が /api/auth/session を見つける
  // POST() が定義されている！
  // その HTTP リクエスト全体を request として渡す

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
  return onAuthStateChanged(auth, async (user) => {
    const store = useAuthStore.getState();
    store.setUser(user);
    if (user) {
      await store.createSession(user);
    }
  });
}

export default useAuthStore;
