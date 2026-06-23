import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { getBirthdayModeState, JUDY_BIRTHDAY_VERSE } from "../features/birthday.js";

const PARTICLE_EMOJIS = ["🎂", "🎉", "💕", "✨", "🌷", "🎈", "💖", "🌸"];
const PARTICLE_COUNT = 22;

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    emoji: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
    left: Math.random() * 100,
    animDuration: 4 + Math.random() * 8,
    animDelay: Math.random() * 6,
    fontSize: 14 + Math.random() * 18,
  }));
}

export default function BirthdayMode({ onReplayStateChange }) {
  const [manualOverride, setManualOverride] = useState(null);
  const [wasActive, setWasActive] = useState(null);
  const [splashVisible, setSplashVisible] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const audioRef = useRef(null);
  const particles = useMemo(generateParticles, []);

  const bdState = getBirthdayModeState({ manualOverride, wasActive });
  const { active, transitionedOn, shouldAutoShowSplash } = bdState;

  // Listen for toggle event from Sidebar button
  useEffect(() => {
    const handler = () => setManualOverride((prev) => (prev === null || prev === false ? true : false));
    window.addEventListener("toggle-birthday-replay", handler);
    return () => window.removeEventListener("toggle-birthday-replay", handler);
  }, []);

  // Track wasActive for transition detection
  useEffect(() => {
    setWasActive(active);
  }, [active]);

  // Toggle body class
  useEffect(() => {
    document.body.classList.toggle("birthday-mode", active);
    return () => document.body.classList.remove("birthday-mode");
  }, [active]);

  // Show splash on transition
  useEffect(() => {
    if (transitionedOn || shouldAutoShowSplash) {
      setSplashVisible(true);
    }
    if (!active) {
      setSplashVisible(false);
      // Stop music when birthday mode ends
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setMusicPlaying(false);
      }
    }
  }, [active, transitionedOn, shouldAutoShowSplash]);

  // Communicate state to parent
  useEffect(() => {
    if (onReplayStateChange) {
      onReplayStateChange({
        active,
        replayButtonText: bdState.replayButtonText,
        verse: active ? JUDY_BIRTHDAY_VERSE : null,
      });
    }
  }, [active, bdState.replayButtonText, onReplayStateChange]);

  const handleToggleReplay = useCallback(() => {
    setManualOverride((prev) => (prev === null || prev === false ? true : false));
  }, []);

  // Expose toggle for parent to call
  useEffect(() => {
    if (onReplayStateChange) {
      onReplayStateChange({
        active,
        replayButtonText: bdState.replayButtonText,
        verse: active ? JUDY_BIRTHDAY_VERSE : null,
        toggleReplay: handleToggleReplay,
      });
    }
  }, [active, bdState.replayButtonText, onReplayStateChange, handleToggleReplay]);

  const handleSplashEnter = useCallback(() => {
    setSplashVisible(false);
    // Start music (user gesture satisfies autoplay policy)
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.volume = 0.5;
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  }, []);

  if (!active) return null;

  return (
    <>
      {/* Audio element */}
      <audio ref={audioRef} src="birthday-song.mp3" preload="auto" loop />

      {/* Music control button */}
      <button
        className={`bd-music${active ? " show" : ""}${musicPlaying ? " playing" : ""}`}
        title="点击 暂停 / 播放"
        onClick={toggleMusic}
      >
        <span className="bd-music-icon">{musicPlaying ? "♫" : "♪"}</span>
        <span className="bd-music-label">为欣欣播放</span>
      </button>

      {/* Birthday splash overlay */}
      <div className={`birthday-splash${splashVisible ? " show" : ""}`}>
        <div className="bd-splash-content">
          <div className="bd-cake-anim">🎂</div>
          <h1 className="bd-title">生日快乐</h1>
          <p className="bd-name">欣欣 💕</p>
          <p className="bd-subtitle">
            愿你今天像被星星和棉花糖一起拥抱的小公主
            <br />
            愿你这一年，每一天都被爱、被祝福
          </p>
          <button className="bd-enter-btn" onClick={handleSplashEnter}>
            推开门进入今天 ✨
          </button>
        </div>
      </div>

      {/* Floating confetti particles */}
      <div className="bd-floating" id="bdFloating">
        {particles.map((p) => (
          <span
            key={p.id}
            className="bd-particle"
            style={{
              left: `${p.left}%`,
              fontSize: `${p.fontSize}px`,
              animationDuration: `${p.animDuration}s`,
              animationDelay: `${p.animDelay}s`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

    </>
  );
}

export function BirthdayLetter() {
  const { data, saveMerge } = useData();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const birthdayLetter = data?.birthdayLetter || "";

  const handleEditStart = () => {
    setEditText(birthdayLetter);
    setEditing(true);
  };
  const handleEditCancel = () => setEditing(false);
  const handleEditSave = () => {
    saveMerge({ birthdayLetter: editText });
    setEditing(false);
  };

  return (
    <div className="section bd-letter-section" id="bdLetterSection">
      <div className="bd-letter-card">
        <div className="bd-letter-head">
          <span className="bd-icon">💌</span>
          <div className="bd-from">
            Luke 写给欣欣<span className="from-small">A Birthday Letter</span>
          </div>
          {!editing && (
            <button className="bd-edit-btn" onClick={handleEditStart}>
              ✏️ 编辑
            </button>
          )}
        </div>

        {!editing ? (
          <>
            <div className={`bd-letter-body${!birthdayLetter.trim() ? " empty" : ""}`}>
              {birthdayLetter.trim() || "还没有写信哦，点击「编辑」开始写吧 ✍️"}
            </div>
            {birthdayLetter.trim() && (
              <div className="bd-letter-sign">— 永远爱你的 Luke 💕</div>
            )}
          </>
        ) : (
          <>
            <textarea
              className="bd-letter-edit"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={
                "亲爱的欣欣...\n\n把这一年想对她说的话写在这里。可以是感谢、是祝福、是承诺、是想到她就想笑的小事。这封信会一直留着，明年这一天再打开，会笑会哭。\n\n—— Luke"
              }
            />
            <div className="bd-letter-actions">
              <button className="btn" onClick={handleEditCancel}>
                取消
              </button>
              <button className="btn primary" onClick={handleEditSave}>
                保存
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
