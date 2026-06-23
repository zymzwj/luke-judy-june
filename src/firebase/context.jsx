import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "./client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not signed in

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const login = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider(), browserPopupRedirectResolver);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
