import React, { useState } from "react";
import { GraduationCap } from "lucide-react";
import { supabase } from "../lib/supabase";

/**
 * 로그인 화면 - 구글 OAuth 로그인 버튼 제공
 */
export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 로그인 후 현재 사이트로 복귀
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setErrorMsg("로그인에 실패했습니다: " + error.message);
      setLoading(false);
    }
    // 성공 시 구글 인증 페이지로 리디렉션되므로 별도 처리 불필요
  };

  return (
    <div style={wrapperStyle}>
      <div className="glass-panel" style={cardStyle}>
        <div style={logoAreaStyle}>
          <GraduationCap size={40} color="#a78bfa" />
          <h1 style={titleStyle}>
            스쿨링크 <span style={subTitleStyle}>SchoolLink</span>
          </h1>
        </div>

        <p style={descStyle}>
          친구들과 함께 공부하고 질문을 나누는 학습 커뮤니티입니다.
          <br />
          구글 계정으로 간편하게 시작하세요.
        </p>

        {errorMsg && <div style={errorStyle}>{errorMsg}</div>}

        <button onClick={handleGoogleLogin} disabled={loading} style={googleBtnStyle}>
          <GoogleIcon />
          {loading ? "이동 중..." : "구글로 로그인"}
        </button>

        <p style={footerStyle}>로그인하면 질문 작성·답변·포인트 적립이 가능합니다.</p>
      </div>
    </div>
  );
}

// 구글 로고 SVG (공식 컬러)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10 }}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

// --- 스타일 ---
const wrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100dvh",
  backgroundColor: "var(--bg-primary)",
  padding: "20px"
};

const cardStyle = {
  width: "100%",
  maxWidth: "400px",
  padding: "40px 32px",
  borderRadius: "20px",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-secondary)",
  textAlign: "center",
  boxShadow: "var(--shadow-lg)"
};

const logoAreaStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px"
};

const titleStyle = {
  fontSize: "26px",
  fontWeight: "800",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "baseline",
  gap: "8px"
};

const subTitleStyle = {
  fontSize: "14px",
  fontWeight: "400",
  color: "var(--text-secondary)",
  textTransform: "uppercase"
};

const descStyle = {
  fontSize: "14px",
  color: "var(--text-secondary)",
  lineHeight: "1.6",
  marginBottom: "28px"
};

const errorStyle = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#f87171",
  padding: "10px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "16px"
};

const googleBtnStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "13px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#ffffff",
  color: "#1f2937",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "opacity var(--transition-fast)"
};

const footerStyle = {
  fontSize: "11px",
  color: "var(--text-muted)",
  marginTop: "20px"
};
