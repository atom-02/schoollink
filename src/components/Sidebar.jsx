import React from "react";
import { User, Hash, Award, BookOpen } from "lucide-react";

/**
 * 1단: 좌측 사이드바 컴포넌트
 * @param {Object} currentUser - 현재 로그인된 사용자 정보
 * @param {string} selectedKeyword - 현재 필터링을 위해 선택된 키워드
 * @param {function} onSelectKeyword - 키워드 선택 시 부모 컴포넌트에 알릴 콜백 함수
 * @param {string[]} keywords - 노출할 키워드 목록
 */
export default function Sidebar({
  currentUser,
  selectedKeyword,
  onSelectKeyword,
  keywords
}) {
  return (
    <aside className="glass-panel sidebar-container" style={sidebarStyle}>
      {/* 1. 상단 사용자 프로필 카드 */}
      <div className="user-profile-card" style={profileCardStyle}>
        <div style={avatarWrapperStyle}>
          <img
            src={currentUser.profileImage}
            alt={currentUser.name}
            style={avatarStyle}
          />
          <div style={statusDotStyle}></div>
        </div>
        <div style={userInfoStyle}>
          <h3 style={userNameStyle}>{currentUser.name}</h3>
          <span style={userRoleStyle}>
            <User size={12} style={{ marginRight: 4 }} />
            {currentUser.role}
          </span>
        </div>
        
        {/* 포인트 뱃지 (보상 학습 요소) */}
        <div style={pointsBadgeStyle}>
          <Award size={14} color="#fcd34d" style={{ marginRight: 4 }} />
          <span style={pointsTextStyle}>{currentUser.points} P</span>
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* 2. 과목 키워드 카테고리 리스트 */}
      <div className="keyword-section" style={keywordSectionStyle}>
        <h4 style={sectionTitleStyle}>
          <BookOpen size={16} style={{ marginRight: 6 }} />
          학습 과목 키워드
        </h4>
        <nav style={navListStyle}>
          {keywords.map((keyword) => {
            const isActive = selectedKeyword === keyword;
            return (
              <button
                key={keyword}
                onClick={() => onSelectKeyword(keyword)}
                className={isActive ? "btn-active-keyword" : ""}
                style={isActive ? activeKeywordBtnStyle : keywordBtnStyle}
              >
                <Hash size={16} color={isActive ? "#fff" : "#9ca3af"} style={{ marginRight: 8 }} />
                <span style={{ fontWeight: isActive ? "600" : "400" }}>{keyword}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. 하단 학급 정보/안내 데코레이션 */}
      <div style={footerCardStyle}>
        <p style={footerTextStyle}>📚 서로 가르쳐줄 때 배움은 배가 됩니다.</p>
      </div>
    </aside>
  );
}

// --- 인라인 스타일 정의 (CSS 스타일 믹스) ---
const sidebarStyle = {
  width: "260px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  borderRight: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-secondary)",
  zIndex: 10
};

const profileCardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "16px",
  borderRadius: "14px",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  border: "1px solid var(--border-color)",
  textAlign: "center",
  marginBottom: "20px"
};

const avatarWrapperStyle = {
  position: "relative",
  marginBottom: "10px"
};

const avatarStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "50%",
  backgroundColor: "var(--bg-tertiary)",
  border: "2px solid var(--accent-purple)",
  padding: "2px"
};

const statusDotStyle = {
  position: "absolute",
  bottom: "2px",
  right: "2px",
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  backgroundColor: "#10b981", // 온라인(Online) 초록색 상태 표시
  border: "2px solid var(--bg-secondary)"
};

const userInfoStyle = {
  marginBottom: "8px"
};

const userNameStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "var(--text-primary)"
};

const userRoleStyle = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "11px",
  color: "var(--text-secondary)",
  backgroundColor: "rgba(255, 255, 255, 0.06)",
  padding: "2px 8px",
  borderRadius: "9999px",
  marginTop: "4px"
};

const pointsBadgeStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(252, 211, 77, 0.1)",
  border: "1px solid rgba(252, 211, 77, 0.3)",
  padding: "6px 12px",
  borderRadius: "8px",
  width: "100%"
};

const pointsTextStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "#fcd34d"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--border-color)",
  margin: "0 0 20px 0"
};

const keywordSectionStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto"
};

const sectionTitleStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  marginBottom: "12px",
  display: "flex",
  alignItems: "center"
};

const navListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

const keywordBtnStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  fontSize: "14px",
  cursor: "pointer",
  textAlign: "left",
  transition: "all var(--transition-fast)"
};

// 활성화(선택)된 키워드 스타일
const activeKeywordBtnStyle = {
  ...keywordBtnStyle,
  color: "#ffffff",
  background: "var(--accent-gradient)",
  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
  transform: "translateX(4px)"
};

const footerCardStyle = {
  padding: "12px",
  borderRadius: "10px",
  backgroundColor: "rgba(139, 92, 246, 0.05)",
  border: "1px solid rgba(139, 92, 246, 0.15)",
  marginTop: "auto"
};

const footerTextStyle = {
  fontSize: "11px",
  color: "var(--text-secondary)",
  textAlign: "center",
  lineHeight: "1.4"
};
