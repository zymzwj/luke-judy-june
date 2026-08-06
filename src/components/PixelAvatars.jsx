import React from "react";

export default function PixelAvatars({ birthday = false }) {
  return (
    <div
      className={`pixel-avatars${birthday ? " birthday" : ""}`}
      id="pixelAvatars"
    >
      <div className="pixel-avatar judy">
        <img src="./avatar-judy.png" alt="Judy" />
      </div>
      <div className="pixel-avatar luke">
        <img src="./avatar-luke.png" alt="Luke" />
      </div>
    </div>
  );
}
