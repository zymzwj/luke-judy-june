import { initializeApp } from "firebase/app";
import {
  browserPopupRedirectResolver,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { COUPLE_ID, firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const docRef = doc(db, "couples", COUPLE_ID);
export const memoriesColRef = collection(db, "couples", COUPLE_ID, "memories");
export const heroPhotosColRef = collection(db, "couples", COUPLE_ID, "heroPhotos");

export {
  addDoc,
  browserPopupRedirectResolver,
  collection,
  deleteDoc,
  deleteField,
  doc,
  GoogleAuthProvider,
  onAuthStateChanged,
  onSnapshot,
  setDoc,
  signInWithPopup,
  signOut,
  updateDoc
};
