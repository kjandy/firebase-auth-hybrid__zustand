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
  unsubscribe: null, // 自分の投稿監視用

  // タイムライン用State
  timeline: [],
  timelineLoading: false,
  timelineHasMore: true,
  timelineLastDoc: null,

  // タイムライン購読解除（リアルタイム）
  timelineUnsubscribe: null,

  // --- Actions ---
  setLoading: (loading) => set({ loading }),

  // ============================================
  // 自分の投稿：リアルタイム監視開始
  // ============================================
  subscribeToUserPosts: (userId) => {
    const { unsubscribe: prevUnsub } = get();
    if (prevUnsub) prevUnsub();

    set({ loading: true, error: null });

    const q = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate(),
        }));
        set({ posts, loading: false, unsubscribe: unsub });
      },
      (error) => {
        console.error("subscribeToUserPosts error:", error);
        set({ loading: false, error: error.message, unsubscribe: null });
      },
    );

    set({ unsubscribe: unsub });
  },

  // 自分の投稿：監視停止
  unsubscribeFromPosts: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, posts: [] });
    }
  },

  // ============================================
  // タイムライン：リアルタイム購読（最新10件）
  // ============================================
  subscribeTimeline: () => {
    const { timelineUnsubscribe: prev } = get();
    if (prev) prev();

    set({
      timelineLoading: true,
      error: null,
      timeline: [],
      timelineHasMore: true,
      timelineLastDoc: null,
    });

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate(),
        }));

        const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

        set({
          timeline: posts,
          timelineLoading: false,
          timelineHasMore: snapshot.docs.length === 10,
          timelineLastDoc: lastDoc,
          timelineUnsubscribe: unsub,
        });
      },
      (error) => {
        console.error("subscribeTimeline error:", error);
        set({
          timelineLoading: false,
          error: error.message,
          timelineUnsubscribe: null,
        });
      },
    );

    set({ timelineUnsubscribe: unsub });
  },

  // タイムライン：購読停止
  unsubscribeTimeline: () => {
    const { timelineUnsubscribe } = get();
    if (timelineUnsubscribe) {
      timelineUnsubscribe();
      set({ timelineUnsubscribe: null });
    }
  },

  // ============================================
  // タイムライン：次の10件を取得（ページング）
  // ※ 注意：最新10件は onSnapshot でリアルタイム
  //         それ以降を「追加読み込み」する用途
  // ============================================
  loadMoreTimeline: async () => {
    const { timelineLastDoc, timelineHasMore, timelineLoading } = get();

    if (!timelineHasMore || timelineLoading) return;
    if (!timelineLastDoc) return; // 初回がまだ or 0件

    set({ timelineLoading: true, error: null });

    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(timelineLastDoc),
        limit(10),
      );

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate(),
      }));

      const lastDoc =
        snapshot.docs[snapshot.docs.length - 1] ?? timelineLastDoc;

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

  // タイムラインをリセット（UI都合）
  resetTimeline: () => {
    set({ timeline: [], timelineHasMore: true, timelineLastDoc: null });
  },

  // ============================================
  // 投稿を追加
  // ============================================
  addPost: async (
    userId,
    userEmail,
    userName,
    userPhotoURL,
    title,
    content,
  ) => {
    try {
      await addDoc(collection(db, "posts"), {
        userId,
        userEmail: userEmail ?? "",
        userName: userName ?? "",
        userPhotoURL: userPhotoURL ?? "",
        title,
        content,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Add post error:", error);
      set({ error: error.message });
      throw error;
    }
  },

  // ============================================
  // 投稿を削除
  // ============================================
  deletePost: async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Delete post error:", error);
      set({ error: error.message });
      throw error;
    }
  },
}));

export default useFirestoreStore;
