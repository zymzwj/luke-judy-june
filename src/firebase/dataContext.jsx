import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  addDoc,
  db,
  deleteDoc,
  deleteField,
  doc,
  docRef,
  heroPhotosColRef,
  memoriesColRef,
  onSnapshot,
  setDoc,
  updateDoc
} from "./client.js";
import { useAuth } from "./context.jsx";
import { DEFAULT_EVENTS } from "../data/calendar.js";

const COUPLE_ID = "luke-judy";

const DataContext = createContext(null);

const EMPTY = {
  events: [], habits: {}, moods: {}, photos: [],
  weeklyPlans: {}, dailyPlans: {}, dateMessages: {},
  meds: { startDate: "", taken: {} },
  bonuses: [], seedsApplied: {}, timeLogs: {},
  prayers: [], devotionNotes: {},
  weeklyRetros: {}, birthdayLetter: "",
  sweetInbox: [], bucketList: [], monthlyGoals: []
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [syncState, setSyncState] = useState({ state: "", msg: "已同步" });
  const [loading, setLoading] = useState(true);
  const unsubDoc = useRef(null);
  const unsubMem = useRef(null);

  useEffect(() => {
    if (!user) {
      setData(null);
      setMemories([]);
      setLoading(false);
      if (unsubDoc.current) { unsubDoc.current(); unsubDoc.current = null; }
      if (unsubMem.current) { unsubMem.current(); unsubMem.current = null; }
      return;
    }

    setLoading(true);

    unsubMem.current = onSnapshot(memoriesColRef, snap => {
      setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.warn("memories snapshot err", err));

    unsubDoc.current = onSnapshot(docRef, async snap => {
      if (snap.exists()) {
        const d = snap.data();
        const meds = d.meds || { startDate: "", taken: {} };
        if (!meds.taken) meds.taken = {};
        setData({
          events: d.events || [],
          habits: d.habits || {},
          moods: d.moods || {},
          photos: d.photos || [],
          weeklyPlans: d.weeklyPlans || {},
          dailyPlans: d.dailyPlans || {},
          dateMessages: d.dateMessages || {},
          meds,
          bonuses: Array.isArray(d.bonuses) ? d.bonuses : [],
          seedsApplied: d.seedsApplied || {},
          timeLogs: d.timeLogs || {},
          prayers: Array.isArray(d.prayers) ? d.prayers : [],
          devotionNotes: d.devotionNotes || {},
          weeklyRetros: d.weeklyRetros || {},
          birthdayLetter: d.birthdayLetter || "",
          sweetInbox: Array.isArray(d.sweetInbox) ? d.sweetInbox : [],
          bucketList: Array.isArray(d.bucketList) ? d.bucketList : [],
          monthlyGoals: Array.isArray(d.monthlyGoals) ? d.monthlyGoals : []
        });

        // One-time migration: memories from main doc to subcollection
        if (Array.isArray(d.memories) && d.memories.length > 0 && !(d.seedsApplied || {}).memoriesMigratedV2) {
          try {
            for (const mem of d.memories) {
              const { id, ...rest } = mem;
              try { await addDoc(memoriesColRef, rest); } catch(e) { console.warn("migrate memory", e); }
            }
            await updateDoc(docRef, { memories: deleteField(), "seedsApplied.memoriesMigratedV2": true });
          } catch(e) { console.warn("memory migration failed", e); }
        }

        // Auto-seed Judy's birthday bonus
        if (!(d.seedsApplied || {}).judyBirthdayBonus) {
          try {
            const bonus = {
              id: "judy-birthday-party-2026", person: "judy", pts: 100,
              reason: "\u{1F382} 举办了一个超棒的生日 party，准备了很多",
              at: Date.now()
            };
            await updateDoc(docRef, {
              bonuses: [...(Array.isArray(d.bonuses) ? d.bonuses : []), bonus],
              "seedsApplied.judyBirthdayBonus": true
            });
          } catch(e) { console.warn("seed bonus failed", e); }
        }
      } else {
        const init = { ...EMPTY, events: [...DEFAULT_EVENTS], createdAt: new Date().toISOString() };
        setData(init);
        await setDoc(docRef, init);
      }
      setLoading(false);
    }, err => {
      console.error("Snapshot error:", err);
      setSyncState({ state: "error", msg: "同步错误: " + err.message });
      setLoading(false);
    });

    return () => {
      if (unsubDoc.current) unsubDoc.current();
      if (unsubMem.current) unsubMem.current();
    };
  }, [user]);

  const save = async (fn) => {
    setSyncState({ state: "saving", msg: "保存中..." });
    try {
      await fn();
      setSyncState({ state: "", msg: "已同步" });
    } catch (e) {
      console.error(e);
      setSyncState({ state: "error", msg: "保存失败: " + e.message });
      throw e;
    }
  };

  // Convenience save methods
  const saveField = (field, value) => save(() =>
    value !== undefined ? setDoc(docRef, { [field]: value }, { merge: true }) : updateDoc(docRef, { [field]: deleteField() })
  );

  const updateField = (path, value) => save(() =>
    value !== undefined && value !== null
      ? updateDoc(docRef, { [path]: value })
      : updateDoc(docRef, { [path]: deleteField() })
  );

  const saveMerge = (obj) => save(() => setDoc(docRef, obj, { merge: true }));

  const addMemory = (memData) => save(() => addDoc(memoriesColRef, memData));

  const deleteMemory = (id) => save(() => deleteDoc(doc(db, "couples", COUPLE_ID, "memories", id)));

  return (
    <DataContext.Provider value={{
      data: data || EMPTY,
      memories,
      loading,
      syncState,
      save,
      saveField,
      updateField,
      saveMerge,
      addMemory,
      deleteMemory,
      docRef
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
