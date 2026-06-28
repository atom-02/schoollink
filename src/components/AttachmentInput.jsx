import React, { useRef, useState, useEffect } from "react";
import { ImagePlus, PenLine, X } from "lucide-react";
import DrawModal from "./DrawModal";

/**
 * 이미지 첨부 입력 (사진 파일 선택 + 펜으로 그리기)
 * 단일 이미지를 다루며, 변경 시 onChange(Blob|null) 로 부모에 전달한다.
 * @param {Blob|File|null} attachment 현재 첨부 이미지
 * @param {function} onChange (blob|null) => void
 */
export default function AttachmentInput({ attachment, onChange }) {
  const fileInputRef = useRef(null);
  const [showDraw, setShowDraw] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 첨부가 바뀌면 미리보기 URL 갱신 (메모리 누수 방지 위해 해제)
  useEffect(() => {
    if (!attachment) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(attachment);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
  };

  return (
    <div>
      <div style={btnRowStyle}>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={attachBtnStyle}>
          <ImagePlus size={15} style={{ marginRight: 6 }} />
          사진 첨부
        </button>
        <button type="button" onClick={() => setShowDraw(true)} style={attachBtnStyle}>
          <PenLine size={15} style={{ marginRight: 6 }} />
          펜으로 그리기
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFilePick}
          style={{ display: "none" }}
        />
      </div>

      {/* 미리보기 */}
      {previewUrl && (
        <div style={previewWrapStyle}>
          <img src={previewUrl} alt="첨부 미리보기" style={previewImgStyle} />
          <button
            type="button"
            onClick={() => onChange(null)}
            style={removeBtnStyle}
            title="첨부 제거"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 펜 그리기 모달 */}
      {showDraw && (
        <DrawModal
          onCancel={() => setShowDraw(false)}
          onComplete={(blob) => {
            onChange(blob);
            setShowDraw(false);
          }}
        />
      )}
    </div>
  );
}

// --- 스타일 ---
const btnRowStyle = { display: "flex", gap: "8px", flexWrap: "wrap" };

const attachBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 12px",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
  background: "rgba(255,255,255,0.04)",
  color: "var(--text-secondary)",
  fontSize: "12px",
  cursor: "pointer",
  transition: "all var(--transition-fast)"
};

const previewWrapStyle = {
  position: "relative",
  display: "inline-block",
  marginTop: "10px"
};

const previewImgStyle = {
  maxWidth: "100%",
  maxHeight: "200px",
  borderRadius: "10px",
  border: "1px solid var(--border-color)",
  display: "block"
};

const removeBtnStyle = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  width: "26px",
  height: "26px",
  borderRadius: "50%",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-primary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
