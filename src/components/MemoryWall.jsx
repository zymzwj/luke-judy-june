import React, { useCallback, useRef, useState } from "react";
import { useData } from "../firebase/dataContext.jsx";

export default function MemoryWall() {
  const { memories, addMemory, deleteMemory } = useData();
  const [showModal, setShowModal] = useState(false);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [date, setDate] = useState("");
  const fileRef = useRef(null);

  const sorted = [...memories].sort((a, b) => {
    const toMs = (v) => {
      if (!v) return 0;
      if (v.toMillis) return v.toMillis();
      if (typeof v === "number") return v;
      const t = new Date(v).getTime();
      return isNaN(t) ? 0 : t;
    };
    return toMs(b.createdAt) - toMs(a.createdAt);
  });

  const handlePhoto = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const maxDim = 700;
      const bmp = await createImageBitmap(file, {
        resizeWidth: maxDim,
        resizeHeight: maxDim,
        resizeQuality: "medium"
      });
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxDim / bmp.width, maxDim / bmp.height, 1);
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close();
      setPhoto(canvas.toDataURL("image/jpeg", 0.6));
    } catch (err) {
      console.warn("photo resize failed", err);
    }
  }, []);

  const handleSave = async () => {
    if (!text.trim() && !photo) return;
    await addMemory({
      text: text.trim(),
      photo,
      createdAt: date || new Date().toISOString()
    });
    setText("");
    setPhoto("");
    setDate("");
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("确定删除这条回忆？")) return;
    await deleteMemory(id);
  };

  return (
    <>
      <button className="memory-add-btn" onClick={() => setShowModal(true)}>+ 加一段回忆</button>

      {sorted.length === 0 ? (
        <div className="memory-empty">还没有回忆，快来添加第一条吧！</div>
      ) : (
        <div className="memory-grid">
          {sorted.map((m) => (
            <div className="memory-card" key={m.id}>
              {m.photo && (
                <div
                  className="mem-img"
                  style={{ backgroundImage: `url(${m.photo})` }}
                />
              )}
              <div className="mem-body">
                <div className="mem-date">
                  {m.createdAt ? new Date(m.createdAt).toLocaleDateString("zh-CN") : ""}
                </div>
                <div className="mem-text">{m.text}</div>
                <button
                  className="mem-del"
                  onClick={() => handleDelete(m.id)}
                >删除</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop show" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <h3>添加回忆</h3>
            <div className="mem-modal-body">
              <div
                className={`mem-img-preview${photo ? "" : " empty"}`}
                style={photo ? { backgroundImage: `url(${photo})` } : {}}
                onClick={() => fileRef.current?.click()}
              >
                {!photo && "📷 点击选择照片"}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handlePhoto}
                style={{ display: "none" }}
              />
              <textarea
                placeholder="写点什么..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
              <input
                type="date"
                value={date ? date.slice(0, 10) : ""}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn" onClick={() => setShowModal(false)}>取消</button>
                <button className="btn primary" onClick={handleSave}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
