import React, { useState } from "react";
import { Search, Send, MessageSquare, Clock, Filter, Sparkles, Plus, AlertCircle } from "lucide-react";
import AttachmentInput from "./AttachmentInput";

/**
 * 2단: 중앙 질문 게시판 피드 컴포넌트
 */
export default function MainFeed({
  questions,
  selectedKeyword,
  onSelectQuestion,
  onAddQuestion
}) {
  // 상태 관리 (검색어, 정렬 방식, 신규 질문 폼 필드)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest"); // latest: 최신순, answers: 답변 많은순
  
  // 새 질문 작성 창 열림 여부
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // 질문 작성 필드 상태
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 과목 태그 선택을 위한 사전 태그 목록
  const predefinedTags = ["기초수학", "공통수학2", "미적분"];

  // 1. 키워드 필터링 및 검색어 필터링 적용
  const filteredQuestions = questions
    .filter((q) => {
      // 1단 사이드바의 과목 키워드 필터링
      if (selectedKeyword !== "전체") {
        return q.keywords.includes(selectedKeyword);
      }
      return true;
    })
    .filter((q) => {
      // 검색어 필터링 (제목 또는 내용에 포함 여부)
      const query = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query)
      );
    });

  // 2. 정렬 방식 적용
  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    if (sortBy === "answers") {
      return (b.commentsCount || 0) - (a.commentsCount || 0); // 답변 많은순 (Descending)
    }
    // 기본값: 최신순
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 등록 진행 중 여부 (중복 제출 방지)
  const [submitting, setSubmitting] = useState(false);

  // 질문 등록 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("질문 제목을 입력해 주세요.");
      return;
    }
    if (!newContent.trim()) {
      setErrorMsg("질문 상세 내용을 입력해 주세요.");
      return;
    }
    if (newTags.length === 0) {
      setErrorMsg("최소 한 개 이상의 과목 태그를 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      // 부모 컴포넌트의 추가 함수 호출 (Supabase 저장)
      await onAddQuestion(newTitle, newTags, newContent, newImage);

      // 성공 시 폼 초기화
      setNewTitle("");
      setNewContent("");
      setNewTags([]);
      setTagInput("");
      setNewImage(null);
      setErrorMsg("");
      setIsFormOpen(false); // 작성 창 닫기
    } catch (err) {
      console.error(err);
      setErrorMsg("질문 등록 실패: " + (err?.message || err?.error || JSON.stringify(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // 태그 토글 핸들러
  const handleTagToggle = (tag) => {
    if (newTags.includes(tag)) {
      setNewTags(newTags.filter((t) => t !== tag));
    } else {
      setNewTags([...newTags, tag]);
    }
  };

  // 시간 포맷 유틸리티
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <main className="main-feed-container" style={feedContainerStyle}>
      {/* 1. 피드 헤더: 검색 및 정렬 */}
      <header style={headerStyle}>
        <div style={titleAreaStyle}>
          <h2 style={feedTitleStyle}>
            {selectedKeyword === "전체" ? "전체 질문 피드" : `#${selectedKeyword} 질문 목록`}
          </h2>
          <span style={countTextStyle}>총 {sortedQuestions.length}개의 질문</span>
        </div>

        <div style={filterActionAreaStyle}>
          {/* 검색 바 */}
          <div style={searchBarWrapperStyle}>
            <Search size={16} color="#9ca3af" style={searchIconStyle} />
            <input
              type="text"
              placeholder="질문 제목, 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={searchInputStyle}
            />
          </div>

          {/* 정렬 토글 */}
          <div style={sortToggleStyle}>
            <button
              onClick={() => setSortBy("latest")}
              style={sortBy === "latest" ? activeSortBtnStyle : sortBtnStyle}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy("answers")}
              style={sortBy === "answers" ? activeSortBtnStyle : sortBtnStyle}
            >
              답변순
            </button>
          </div>
        </div>
      </header>

      {/* 2. 질문 등록 버튼 / 아코디언 입력 폼 */}
      <div style={formWrapperStyle}>
        {!isFormOpen ? (
          <button onClick={() => setIsFormOpen(true)} className="btn btn-primary" style={openFormBtnStyle}>
            <Plus size={16} />
            궁금한 내용 질문하기 (글쓰기)
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={formStyle}>
            <h3 style={formTitleStyle}>
              <Sparkles size={16} color="#a78bfa" style={{ marginRight: 6 }} />
              새로운 질문 작성
            </h3>
            
            {errorMsg && (
              <div style={errorBannerStyle}>
                <AlertCircle size={16} style={{ marginRight: 6 }} />
                {errorMsg}
              </div>
            )}

            <div style={formGroupStyle}>
              <input
                type="text"
                placeholder="어떤 내용이 궁금한가요? 한 줄로 제목을 요약해 주세요."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="input-field"
                style={{ padding: "10px 14px" }}
              />
            </div>

            {/* 과목 태그 선택기 */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>과목 카테고리 태그 선택</label>
              <div style={tagSelectContainerStyle}>
                {predefinedTags.map((tag) => {
                  const isSelected = newTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      style={isSelected ? activeTagChipStyle : tagChipStyle}
                    >
                      {isSelected ? `✓ ${tag}` : tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={formGroupStyle}>
              <textarea
                placeholder="이해하기 어려운 부분이나 문제를 상세히 적어주세요. 수학 문제라면 수식이나 식을 써주셔도 좋습니다."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="input-field"
                style={textareaStyle}
              />
            </div>

            {/* 사진 첨부 / 펜 그리기 (수식을 손으로 올릴 때) */}
            <div style={formGroupStyle}>
              <label style={labelStyle}>수식 이미지 첨부 (선택) — 사진을 찍거나 펜으로 그려서 올리세요</label>
              <AttachmentInput attachment={newImage} onChange={setNewImage} />
            </div>

            <div style={formActionStyle}>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setErrorMsg("");
                }}
                className="btn btn-secondary"
                style={{ padding: "8px 16px" }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: "8px 20px" }}
              >
                <Send size={14} />
                {submitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. 질문 카드 리스트 피드 */}
      <div style={scrollFeedStyle}>
        {sortedQuestions.length === 0 ? (
          <div style={emptyStateStyle}>
            <AlertCircle size={32} color="#6b7280" style={{ marginBottom: 12 }} />
            <p style={{ color: "var(--text-secondary)" }}>등록된 질문이 없습니다.</p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: 4 }}>
              첫 번째 질문의 주인공이 되어보세요!
            </p>
          </div>
        ) : (
          sortedQuestions.map((q) => (
            <article
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="card animate-fade-in"
              style={cardStyle}
            >
              {/* 카드 상단: 작성자 프로필 & 정보 */}
              <div style={cardHeaderStyle}>
                <div style={authorInfoStyle}>
                  <img src={q.userProfile} alt={q.userName} style={cardAvatarStyle} />
                  <div>
                    <span style={authorNameStyle}>{q.userName}</span>
                    <div style={timeWrapperStyle}>
                      <Clock size={12} style={{ marginRight: 3 }} />
                      <span>{formatTime(q.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {/* 답변 수 표시 */}
                <div style={commentBadgeStyle(q.commentsCount > 0)}>
                  <MessageSquare size={13} style={{ marginRight: 4 }} />
                  <span>답변 {q.commentsCount || 0}</span>
                </div>
              </div>

              {/* 카드 본문: 제목 및 내용 일부 */}
              <div style={cardBodyStyle}>
                <h4 style={cardTitleStyle}>{q.title}</h4>
                <p className="line-clamp-2" style={cardContentStyle}>{q.content}</p>
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="첨부 이미지" style={cardImageStyle} />
                )}
              </div>

              {/* 카드 하단: 태그 리스트 */}
              <div style={cardFooterStyle}>
                {q.keywords.map((tag) => (
                  <span key={tag} className="tag-badge" style={{ marginRight: 6 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

// --- 인라인 스타일 정의 ---
const feedContainerStyle = {
  flex: 1,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--bg-primary)",
  padding: "20px 24px",
  overflow: "hidden"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  flexWrap: "wrap",
  gap: "12px"
};

const titleAreaStyle = {
  display: "flex",
  flexDirection: "column"
};

const feedTitleStyle = {
  fontSize: "20px",
  color: "var(--text-primary)"
};

const countTextStyle = {
  fontSize: "12px",
  color: "var(--text-muted)",
  marginTop: "2px"
};

const filterActionAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const searchBarWrapperStyle = {
  position: "relative",
  width: "220px"
};

const searchIconStyle = {
  position: "absolute",
  left: "12px",
  top: "50%",
  transform: "translateY(-50%)"
};

const searchInputStyle = {
  paddingLeft: "34px",
  paddingRight: "12px",
  height: "36px"
};

const sortToggleStyle = {
  display: "flex",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  padding: "2px",
  border: "1px solid var(--border-color)"
};

const sortBtnStyle = {
  padding: "6px 12px",
  fontSize: "12px",
  border: "none",
  background: "transparent",
  color: "var(--text-secondary)",
  cursor: "pointer",
  borderRadius: "6px",
  transition: "all var(--transition-fast)"
};

const activeSortBtnStyle = {
  ...sortBtnStyle,
  color: "white",
  backgroundColor: "rgba(255, 255, 255, 0.1)"
};

const formWrapperStyle = {
  marginBottom: "16px"
};

const openFormBtnStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "14px"
};

const formStyle = {
  padding: "18px",
  borderRadius: "12px",
  border: "1px solid var(--border-color)",
  backgroundColor: "var(--bg-secondary)"
};

const formTitleStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "var(--text-primary)",
  marginBottom: "14px",
  display: "flex",
  alignItems: "center"
};

const errorBannerStyle = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  color: "#f87171",
  padding: "8px 12px",
  borderRadius: "8px",
  fontSize: "13px",
  marginBottom: "12px"
};

const formGroupStyle = {
  marginBottom: "12px"
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "var(--text-secondary)",
  marginBottom: "6px",
  fontWeight: "500"
};

const tagSelectContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
};

const tagChipStyle = {
  padding: "5px 12px",
  borderRadius: "9999px",
  border: "1px solid var(--border-color)",
  backgroundColor: "rgba(0, 0, 0, 0.15)",
  color: "var(--text-secondary)",
  fontSize: "12px",
  cursor: "pointer",
  transition: "all var(--transition-fast)"
};

const activeTagChipStyle = {
  ...tagChipStyle,
  backgroundColor: "rgba(139, 92, 246, 0.2)",
  borderColor: "var(--accent-purple)",
  color: "#c084fc"
};

const textareaStyle = {
  minHeight: "90px",
  resize: "vertical",
  lineHeight: "1.5",
  padding: "12px"
};

const formActionStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "8px",
  marginTop: "4px"
};

const scrollFeedStyle = {
  flex: 1,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  paddingBottom: "10px"
};

const cardStyle = {
  cursor: "pointer",
  textAlign: "left"
};

const cardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "10px"
};

const authorInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const cardAvatarStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.05)"
};

const authorNameStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-primary)",
  display: "block"
};

const timeWrapperStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "11px",
  color: "var(--text-muted)"
};

const commentBadgeStyle = (hasComments) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "500",
  backgroundColor: hasComments ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.05)",
  color: hasComments ? "#60a5fa" : "var(--text-secondary)",
  border: hasComments ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent"
});

const cardBodyStyle = {
  marginBottom: "12px"
};

const cardTitleStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "var(--text-primary)",
  marginBottom: "6px",
  lineHeight: "1.4"
};

const cardContentStyle = {
  fontSize: "13px",
  color: "var(--text-secondary)",
  lineHeight: "1.5"
};

const cardImageStyle = {
  marginTop: "10px",
  maxWidth: "100%",
  maxHeight: "180px",
  borderRadius: "8px",
  border: "1px solid var(--border-color)",
  objectFit: "cover"
};

const cardFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "4px"
};

const emptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 0",
  textAlign: "center"
};
