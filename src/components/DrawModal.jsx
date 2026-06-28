import React, { useRef, useEffect, useState } from "react";
import { X, Eraser, RotateCcw, Check } from "lucide-react";

/**
 * 펜 그리기 캔버스 모달
 * 마우스/터치/스타일러스(포인터 이벤트)로 그림을 그려 PNG 이미지로 내보낸다.
 * @param {function} onComplete (blob) => void  - 완료 시 그린 이미지(PNG Blob) 전달
 * @param {function} onCancel - 취소
 */
const COLORS = ["#1f2937", "#ef4444", "#2563eb", "#16a34a"];
const CANVAS_W = 900;
const CANVAS_H = 560;

export default function DrawModal({ onComplete, onCancel }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // 캔버스 초기화 (흰 배경)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // 화면 좌표를 캔버스 내부 해상도 좌표로 변환
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const handlePointerMove = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.strokeStyle = isEraser ? "#ffffff" : color;
    ctx.lineWidth = isEraser ? 24 : lineWidth;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    if (!hasDrawn) setHasDrawn(true);
  };

  const handlePointerUp = (e) => {
    drawing.current = false;
    try {
      canvasRef.current.releasePointerCapture(e.pointerId);
    } catch {
      /* 무시 */
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleComplete = () => {
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) onComplete(blob);
      },
      "image/png"
    );
  };

  return (
    <div style={backdropStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={headerStyle}>
          <span style={titleStyle}>✏️ 펜으로 수식 그리기</span>
          <button onClick={onCancel} style={iconBtnStyle} title="닫기">
            <X size={18} />
          </button>
        </div>

        {/* 도구 모음 */}
        <div style={toolbarStyle}>
          <div style={colorGroupStyle}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setIsEraser(false);
                }}
                style={{
                  ...swatchStyle,
                  backgroundColor: c,
                  outline: !isEraser && color === c ? "2px solid #a78bfa" : "none"
                }}
                title="펜 색상"
              />
            ))}
          </div>

          <div style={sizeGroupStyle}>
            {[3, 6, 10].map((w) => (
              <button
                key={w}
                onClick={() => {
                  setLineWidth(w);
                  setIsEraser(false);
                }}
                style={{
                  ...sizeBtnStyle,
                  outline: !isEraser && lineWidth === w ? "2px solid #a78bfa" : "none"
                }}
                title={`굵기 ${w}`}
              >
                <span style={{ width: w, height: w, borderRadius: "50%", backgroundColor: "#374151", display: "inline-block" }} />
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsEraser((v) => !v)}
            style={{ ...toolBtnStyle, ...(isEraser ? activeToolStyle : {}) }}
            title="지우개"
          >
            <Eraser size={16} />
          </button>
          <button onClick={handleClear} style={toolBtnStyle} title="전체 지우기">
            <RotateCcw size={16} />
          </button>
        </div>

        {/* 캔버스 */}
        <div style={canvasWrapStyle}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={canvasStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </div>

        {/* 하단 버튼 */}
        <div style={footerStyle}>
          <button onClick={onCancel} className="btn btn-secondary" style={{ padding: "8px 16px" }}>
            취소
          </button>
          <button
            onClick={handleComplete}
            disabled={!hasDrawn}
            className="btn btn-primary"
            style={{ padding: "8px 20px", opacity: hasDrawn ? 1 : 0.5 }}
          >
            <Check size={15} />
            첨부하기
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 스타일 ---
const backdropStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 200,
  padding: "16px"
};

const modalStyle = {
  width: "100%",
  maxWidth: "760px",
  backgroundColor: "var(--bg-secondary)",
  borderRadius: "16px",
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-lg)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 18px",
  borderBottom: "1px solid var(--border-color)"
};

const titleStyle = { fontSize: "15px", fontWeight: "600", color: "var(--text-primary)" };

const iconBtnStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  display: "flex",
  padding: "4px"
};

const toolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  padding: "12px 18px",
  borderBottom: "1px solid var(--border-color)"
};

const colorGroupStyle = { display: "flex", gap: "6px" };

const swatchStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.2)",
  cursor: "pointer"
};

const sizeGroupStyle = { display: "flex", gap: "4px" };

const sizeBtnStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  backgroundColor: "#e5e7eb",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const toolBtnStyle = {
  width: "32px",
  height: "32px",
  borderRadius: "6px",
  border: "1px solid var(--border-color)",
  background: "rgba(255,255,255,0.05)",
  color: "var(--text-secondary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const activeToolStyle = {
  background: "var(--accent-gradient)",
  color: "#fff",
  borderColor: "transparent"
};

const canvasWrapStyle = {
  padding: "16px",
  backgroundColor: "rgba(0,0,0,0.2)"
};

const canvasStyle = {
  width: "100%",
  height: "auto",
  aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  touchAction: "none",
  cursor: "crosshair",
  display: "block"
};

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
  padding: "14px 18px",
  borderTop: "1px solid var(--border-color)"
};
