// ============================================
// 4. Zustand Store (stores/firestoreStore.js)
// ============================================
import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const useFirestoreStore = create((set, get) => ({
  // --- State ---
  posts: [],
  loading: true,
  error: null,
  unsubscribe: null,

  // --- Actions ---
  setLoading: (loading) => set({ loading }),

  // リアルタイム監視開始
  subscribeToUserPosts: (userId) => {
    // 既存の監視があればアンサブスクリベート
    const { unsubscribe: prevUnsub } = get();
    if (prevUnsub) prevUnsub();

    set({ loading: true });

    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      set({ posts, loading: false, unsubscribe: unsub });
    });

    set({ unsubscribe: unsub });
  },

  // 監視停止
  unsubscribeFromPosts: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, posts: [] });
    }
  },

  // 投稿を追加
  addPost: async (userId, title, content) => {
    try {
      await addDoc(collection(db, "posts"), {
        userId,
        title,
        content,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Add post error:", error);
      set({ error: error.message });
    }
  },

  // 投稿を削除
  deletePost: async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Delete post error:", error);
      set({ error: error.message });
    }
  },
}));

export default useFirestoreStore;
