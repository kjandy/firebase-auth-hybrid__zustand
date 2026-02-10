// ============================================
// 4. Zustand Store (stores/firestoreStore.js)
// ============================================
import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const useFirestoreStore = create((set, get) => ({
  // --- State ---
  posts: [],
  loading: true,
  error: null,
  unsubscribe: null,

  // タイムライン用State
  timeline: [],
  timelineLoading: false,
  timelineHasMore: true,
  timelineLastDoc: null,

  // --- Actions ---
  setLoading: (loading) => set({ loading }),

  // リアルタイム監視開始（自分の投稿）
  subscribeToUserPosts: (userId) => {
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

  // タイムライン：最初の10件を取得
  loadTimeline: async () => {
    set({
      timelineLoading: true,
      timeline: [],
      timelineHasMore: true,
      timelineLastDoc: null,
    });

    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(10),
      );

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      set({
        timeline: posts,
        timelineLoading: false,
        timelineHasMore: snapshot.docs.length === 10,
        timelineLastDoc: lastDoc,
      });
    } catch (error) {
      console.error("Load timeline error:", error);
      set({ timelineLoading: false, error: error.message });
    }
  },

  // タイムライン：次の10件を取得
  loadMoreTimeline: async () => {
    const { timelineLastDoc, timelineHasMore, timelineLoading } = get();

    if (!timelineHasMore || timelineLoading) return;

    set({ timelineLoading: true });

    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(timelineLastDoc),
        limit(10),
      );

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      set((state) => ({
        timeline: [...state.timeline, ...newPosts],
        timelineLoading: false,
        timelineHasMore: snapshot.docs.length === 10,
        timelineLastDoc: lastDoc,
      }));
    } catch (error) {
      console.error("Load more timeline error:", error);
      set({ timelineLoading: false, error: error.message });
    }
  },

  // タイムラインをリセット
  resetTimeline: () => {
    set({ timeline: [], timelineHasMore: true, timelineLastDoc: null });
  },

  // 投稿を追加
  addPost: async (userId, title, content) => {
    try {
      // ユーザー情報も一緒に保存（タイムライン表示用）
      const userEmail = useAuthStore.getState().user?.email || "";

      await addDoc(collection(db, "posts"), {
        userId,
        userEmail, // ← 追加
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
