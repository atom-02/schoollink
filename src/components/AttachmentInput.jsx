import React, { useRef, useState, useEffect } from "react";
import { ImagePlus, PenLine, X, Camera } from "lucide-react";
import DrawModal from "./DrawModal";

/**
 * 이미지 첨부 입력 (사진 파일 선택 + 펜으로 그리기)
 * 단일 이미지를 다루며, 변경 시 onChange(Blob|null) 로 부모에 전달한다.
 * @param {Blob|File|null} attachment 현재 첨부 이미지
 * @param {function} onChange (blob|null) => void
 */
export default function AttachmentInput({ attachment, onChange, compact = false }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
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

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록 초기화
    if (!file) return;
    // 카메라/갤러리 사진은 용량이 클 수 있어 업로드 전 축소·압축
    const compressed = await compressImage(file);
    onChange(compressed);
  };

  return (
    <div>
      <div style={btnRowStyle}>
        <button type="button" onClick={() => cameraInputRef.current?.click()} style={attachBtnStyle}>
          <Camera size={15} style={{ marginRight: 6 }} />
          카메라 촬영
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} style={attachBtnStyle}>
          <ImagePlus size={15} style={{ marginRight: 6 }} />
          사진 첨부
        </button>
        <button type="button" onClick={() => setShowDraw(true)} style={attachBtnStyle}>
          <PenLine size={15} style={{ marginRight: 6 }} />
          펜으로 쓰기
        </button>
        {/* 갤러리/파일 선택 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFilePick}
          style={{ display: "none" }}
        />
        {/* 카메라 직접 촬영 (모바일/태블릿) — 후면 카메라 우선 */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFilePick}
          style={{ display: "none" }}
        />
      </div>

      {/* 미리보기 (compact 모드에선 작은 썸네일 — 좁은 화면에서 등록 버튼이 가려지지 않도록) */}
      {previewUrl && (
        <div style={previewWrapStyle}>
          <img
            src={previewUrl}
            alt="첨부 미리보기"
            style={compact ? compactPreviewImgStyle : previewImgStyle}
          />
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

// 카메라/갤러리 이미지를 최대 변(1600px) 기준으로 축소하고 JPEG로 재인코딩한다.
// 업로드 실패(용량/시간초과)를 막고 속도를 높인다. 실패 시 원본을 그대로 반환.
function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        "image/jpeg",
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // 디코딩 실패 시 원본 사용
    };
    img.src = url;
  });
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

const compactPreviewImgStyle = {
  height: "64px",
  maxWidth: "120px",
  objectFit: "cover",
  borderRadius: "8px",
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
