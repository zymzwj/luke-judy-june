import { useEffect, useRef, useState } from "react";
import { onSnapshot } from "firebase/firestore";

export function useFirestoreDoc(docRef) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docRef) return;
    return onSnapshot(docRef, snap => {
      setData(snap.exists() ? snap.data() : null);
      setLoading(false);
    }, err => {
      console.error("Firestore doc error:", err);
      setLoading(false);
    });
  }, [docRef]);

  return { data, loading };
}

export function useCollection(colRef) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!colRef) return;
    return onSnapshot(colRef, snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error("Firestore collection error:", err);
      setLoading(false);
    });
  }, [colRef]);

  return { docs, loading };
}

export function useSyncStatus() {
  const [status, setStatus] = useState({ state: "", msg: "已同步" });

  const wrap = async (fn) => {
    setStatus({ state: "saving", msg: "保存中..." });
    try {
      await fn();
      setStatus({ state: "", msg: "已同步" });
    } catch (e) {
      console.error(e);
      setStatus({ state: "error", msg: "保存失败: " + e.message });
    }
  };

  return { status, wrap };
}
