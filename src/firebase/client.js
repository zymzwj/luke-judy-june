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
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes
} from "firebase/storage";
import { COUPLE_ID, firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const docRef = doc(db, "couples", COUPLE_ID);
export const memoriesColRef = collection(db, "couples", COUPLE_ID, "memories");
export const heroPhotosColRef = collection(db, "couples", COUPLE_ID, "heroPhotos");

let _storage = null;
export function getStorageInstance() {
  if (!_storage) _storage = getStorage(app);
  return _storage;
}

export {
  addDoc,
  browserPopupRedirectResolver,
  collection,
  deleteDoc,
  deleteField,
  deleteObject,
  doc,
  getDownloadURL,
  GoogleAuthProvider,
  onAuthStateChanged,
  onSnapshot,
  setDoc,
  signInWithPopup,
  signOut,
  storageRef,
  updateDoc,
  uploadBytes
};
