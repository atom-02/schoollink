import React from "react";
import { Megaphone, Calendar, Award, MessageSquare, HelpCircle, Trophy } from "lucide-react";

/**
 * 3단: 우측 정보 패널 컴포넌트
 */
export default function RightPanel({ notices, currentUser, questionsCount, answersCount }) {
  
  // 오늘의 공부 명언 랜덤 추출 또는 고정 설정
  const studyQuote = {
    text: "성공은 매일 반복되는 작은 노력들의 합이다.",
    author: "로버트 콜리어"
  };

  // 포인트를 기반으로 레벨 및 등급 계산
  const getLevelInfo = (pts) => {
    if (pts >= 300) return { title: "학습 마스터 🏆", nextLimit: 500, color: "#fbbf24" };
    if (pts >= 150) return { title: "답변 요정 🌟", nextLimit: 300, color: "#60a5fa" };
    return { title: "공부 비기너 🌱", nextLimit: 150, color: "#34d399" };
  };

  const levelInfo = getLevelInfo(currentUser.points);
  const progressPercent = Math.min(100, Math.floor((currentUser.points / levelInfo.nextLimit) * 100));

  // 시간 포맷 유틸리티
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  return (
    <aside className="glass-panel right-panel-container" style={rightPanelStyle}>
      {/* 1. 학교 공지사항 섹션 */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>
          <Megaphone size={16} color="#fbbf24" style={{ marginRight: 6 }} />
          학교 & 학급 공지사항
        </h4>
        <div style={noticeContainerStyle}>
          {notices.map((notice) => (
            <div key={notice.id} style={noticeCardStyle}>
              <div style={noticeHeaderStyle}>
                <span style={noticeAuthorStyle}>{notice.userName}</span>
                <span style={noticeTimeStyle}>
                  <Calendar size={11} style={{ marginRight: 3 }} />
                  {formatDate(notice.createdAt)}
                </span>
              </div>
              <h5 style={noticeTitleStyle}>{notice.title}</h5>
              <p style={noticeContentStyle}>{notice.content}</p>
            </div>
          ))}
        </div>
      </div>

      <hr style={dividerStyle} />

      {/* 2. 내 학습 대시보드 섹션 */}
      <div style={sectionStyle}>
        <h4 style={sectionTitleStyle}>
          <Trophy size={16} color="#a78bfa" style={{ marginRight: 6 }} />
          나의 학습 대시보드
        </h4>
        
        <div style={dashboardCardStyle}>
          <div style={levelAreaStyle}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>현재 등급</span>
            <span style={{ fontSize: "14px", fontWeight: "700", color: levelInfo.color }}>
              {levelInfo.title}
            </span>
          </div>

          {/* 경험치 바 */}
          <div style={progressWrapperStyle}>
            <div style={progressBarContainerStyle}>
              <div style={progressBarStyle(progressPercent, levelInfo.color)}></div>
            </div>
            <div style={progressLabelStyle}>
              <span>{currentUser.points} P</span>
              <span>목표: {levelInfo.nextLimit} P</span>
            </div>
          </div>

          {/* 활동 통계 그리드 */}
          <div style={statsGridStyle}>
            <div style={statBoxStyle}>
              <HelpCircle size={16} color="#c084fc" style={{ marginBottom: 4 }} />
              <span style={statValStyle}>{questionsCount}개</span>
              <span style={statLblStyle}>내 질문</span>
            </div>
            <div style={statBoxStyle}>
              <MessageSquare size={16} color="#60a5fa" style={{ marginBottom: 4 }} />
              <span style={statValStyle}>{answersCount}개</span>
              <span style={statLblStyle}>작성 답변</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 공부 명언 카드 (하단 고정) */}
      <div style={quoteCardStyle}>
        <span style={quoteMarkStyle}>“</span>
        <p style={quoteTextStyle}>{studyQuote.text}</p>
        <span style={quoteAuthorStyleText}>- {studyQuote.author}</span>
      </div>
    </aside>
  );
}

// --- 인라인 스타일 정의 ---
const rightPanelStyle = {
  width: "290px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  borderLeft: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-secondary)",
  zIndex: 10,
  overflowY: "auto"
};

const sectionStyle = {
  marginBottom: "16px"
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

const noticeContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const noticeCardStyle = {
  padding: "12px",
  borderRadius: "10px",
  backgroundColor: "var(--bg-tertiary)",
  border: "1px solid var(--border-color)",
  transition: "border-color var(--transition-fast)"
};

const noticeHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "6px"
};

const noticeAuthorStyle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "#a78bfa",
  backgroundColor: "rgba(139, 92, 246, 0.1)",
  padding: "1px 6px",
  borderRadius: "4px"
};

const noticeTimeStyle = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "10px",
  color: "var(--text-muted)"
};

const noticeTitleStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-primary)",
  marginBottom: "4px"
};

const noticeContentStyle = {
  fontSize: "12px",
  color: "var(--text-secondary)",
  lineHeight: "1.4"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--border-color)",
  margin: "12px 0 20px 0"
};

const dashboardCardStyle = {
  padding: "14px",
  borderRadius: "12px",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  border: "1px solid var(--border-color)"
};

const levelAreaStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px"
};

const progressWrapperStyle = {
  marginBottom: "16px"
};

const progressBarContainerStyle = {
  width: "100%",
  height: "6px",
  backgroundColor: "rgba(255, 255, 255, 0.08)",
  borderRadius: "9999px",
  overflow: "hidden",
  marginBottom: "4px"
};

const progressBarStyle = (percent, color) => ({
  width: `${percent}%`,
  height: "100%",
  backgroundColor: color,
  borderRadius: "9999px",
  transition: "width 0.4s ease-out"
});

const progressLabelStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "10px",
  color: "var(--text-muted)"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px"
};

const statBoxStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "8px 0",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "8px",
  border: "1px solid var(--border-color)"
};

const statValStyle = {
  fontSize: "13px",
  fontWeight: "700",
  color: "var(--text-primary)"
};

const statLblStyle = {
  fontSize: "10px",
  color: "var(--text-secondary)",
  marginTop: "2px"
};

const quoteCardStyle = {
  marginTop: "auto",
  padding: "16px",
  borderRadius: "12px",
  background: "linear-gradient(to bottom right, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.03))",
  border: "1px dashed rgba(255, 255, 255, 0.1)",
  position: "relative",
  textAlign: "center"
};

const quoteMarkStyle = {
  position: "absolute",
  top: "-10px",
  left: "14px",
  fontSize: "36px",
  fontFamily: "Georgia, serif",
  color: "rgba(139, 92, 246, 0.2)",
  lineHeight: "1"
};

const quoteTextStyle = {
  fontSize: "12px",
  fontStyle: "italic",
  color: "var(--text-secondary)",
  lineHeight: "1.5",
  marginBottom: "8px"
};

const quoteAuthorStyleText = {
  fontSize: "10px",
  color: "var(--text-muted)",
  fontWeight: "500"
};
