import React from "react";
import { useAuth } from "../firebase/context.jsx";

export default function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="user-badge" id="userBadge">
      <img
        className="user-avatar"
        id="userAvatar"
        src={user.photoURL || ""}
        alt=""
        referrerPolicy="no-referrer"
      />
      <span id="userName">{user.displayName || user.email || ""}</span>
      <button className="signout-link" id="signoutBtn" onClick={logout}>
        登出
      </button>
    </div>
  );
}
