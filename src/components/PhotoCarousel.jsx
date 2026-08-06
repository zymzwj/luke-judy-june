import React, { useCallback, useEffect, useRef, useState } from "react";
import { useData } from "../firebase/dataContext.jsx";
import { MONTH_CONFIG } from "../firebase/config.js";

function normalizePhoto(p) {
  if (typeof p === "string") return { url: p };
  return p;
}

function getUrl(photo) {
  return normalizePhoto(photo).url;
}

function getFocal(photo) {
  const f = normalizePhoto(photo).focal;
  return f || { x: 50, y: 50 };
}

async function resizeImage(file, maxDim = 1200, quality = 0.7) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (e) {
    return resizeImageFallback(file, maxDim, quality);
  }
  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round(height * (maxDim / width));
      width = maxDim;
    } else {
      width = Math.round(width * (maxDim / height));
      height = maxDim;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  if (bitmap.close) bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

function resizeImageFallback(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoCarousel() {
  const { data, saveField } = useData();
  const photos = data.photos || [];
  const [current, setCurrent] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [focalMode, setFocalMode] = useState(false);
  const timerRef = useRef(null);
  const fileRef = useRef(null);
  const carouselRef = useRef(null);

  const idx = photos.length === 0 ? 0 : current % photos.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (photos.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % photos.length);
      }, 6000);
    }
  }, [photos.length]);

  useEffect(() => {
    if (!focalMode) startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer, focalMode]);

  useEffect(() => {
    if (current >= photos.length && photos.length > 0) {
      setCurrent(photos.length - 1);
    }
  }, [photos.length, current]);

  const goTo = (i) => {
    setCurrent(i);
    startTimer();
  };

  const prev = () => {
    if (photos.length === 0) return;
    goTo((idx - 1 + photos.length) % photos.length);
  };

  const next = () => {
    if (photos.length === 0) return;
    goTo((idx + 1) % photos.length);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newPhotos = [...photos];
    for (const file of files) {
      try {
        const dataUrl = await resizeImage(file);
        newPhotos.push({ url: dataUrl, focal: { x: 50, y: 50 } });
      } catch (err) {
        console.error("Photo resize error:", err);
        alert("照片处理失败: " + err.message);
      }
    }

    if (newPhotos.length > photos.length) {
      await saveField("photos", newPhotos);
      setCurrent(newPhotos.length - 1);
      startTimer();
    }

    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (photos.length === 0) return;
    if (!confirm("确定删除当前照片？")) return;
    const updated = photos.filter((_, i) => i !== idx);
    await saveField("photos", updated);
  };

  const handleFocalClick = async (e) => {
    if (!focalMode || photos.length === 0) return;
    const rect = carouselRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const updated = [...photos];
    const photo = normalizePhoto(updated[idx]);
    updated[idx] = { ...photo, focal: { x, y } };
    await saveField("photos", updated);
  };

  const toggleFocalMode = () => {
    if (focalMode) {
      setFocalMode(false);
      startTimer();
    } else {
      setFocalMode(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const hasPhotos = photos.length > 0;
  const currentFocal = hasPhotos ? getFocal(photos[idx]) : { x: 50, y: 50 };

  return (
    <div className="hero">
      <input
        type="file"
        id="photoInput"
        accept="image/*"
        multiple
        ref={fileRef}
        onChange={handleUpload}
        style={{ display: "none" }}
      />
      <div className="photo-actions">
        <button className="photo-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "⏳ 上传中..." : "📷 添加照片"}
        </button>
        {hasPhotos && (
          <>
            <button className="photo-btn" onClick={toggleFocalMode}>
              {focalMode ? "✓ 完成" : "📍 焦点"}
            </button>
            <button className="photo-btn" id="deletePhotoBtn" onClick={handleDelete}>
              🗑 删除
            </button>
          </>
        )}
      </div>
      <div
        className={`carousel${focalMode ? " focal-mode" : ""}`}
        id="carousel"
        ref={carouselRef}
        onClick={focalMode ? handleFocalClick : undefined}
      >
        <div className="carousel-slides" id="carouselSlides">
          {photos.map((photo, i) => {
            const url = getUrl(photo);
            const focal = getFocal(photo);
            return (
              <div
                key={i}
                className={`carousel-slide${i === idx ? " active" : ""}${i === idx && !focalMode ? ` ken-burns-${(i % 3) + 1}` : ""}`}
                style={{
                  backgroundImage: `url(${url})`,
                  backgroundPosition: `${focal.x}% ${focal.y}%`
                }}
              />
            );
          })}
        </div>
        {focalMode && hasPhotos && (
          <>
            <div
              className="focal-indicator"
              style={{ left: `${currentFocal.x}%`, top: `${currentFocal.y}%` }}
            />
            <div className="focal-hint">点击照片选择焦点位置</div>
          </>
        )}
        {!hasPhotos && (
          <div className="carousel-empty" id="carouselEmpty" onClick={() => fileRef.current?.click()}>
            <span>📷 点击上传你和 Judy 的照片<br /><small>支持多张，自动轮播</small></span>
          </div>
        )}
        {hasPhotos && !focalMode && (
          <>
            <button className="carousel-nav prev" id="carouselPrev" onClick={prev}>‹</button>
            <button className="carousel-nav next" id="carouselNext" onClick={next}>›</button>
            <div className="carousel-dots" id="carouselDots">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`carousel-dot${i === idx ? " active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="hero-overlay">
        <div className="hero-eyebrow">Vol. {MONTH_CONFIG.month - 5} — {MONTH_CONFIG.labelEn} {MONTH_CONFIG.year}</div>
        <h1 className="hero-title">Luke <span className="ampersand">&</span> Judy</h1>
        <div className="hero-sub">
          "两个人总比一个人好，因为二人劳碌同得美好的果效。"
          <span className="verse-cite">— 传道书 4:9</span>
        </div>
      </div>
    </div>
  );
}
