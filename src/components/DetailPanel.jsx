import React, { useState, useRef, useEffect } from "react";
import { X, Send, Clock, MessageCircle, ShieldAlert, Trash2 } from "lucide-react";
import AttachmentInput from "./AttachmentInput";

/**
 * 질문 상세 및 답변(스레드) 서브 슬라이드 패널 컴포넌트
 */
export default function DetailPanel({
  selectedQuestion,
  answers,
  currentUser,
  onClose,
  onAddAnswer,
  onDeleteQuestion,
  onDeleteAnswer
}) {
  const [answerContent, setAnswerContent] = useState("");
  const [answerImage, setAnswerImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const answerListEndRef = useRef(null);

  // 새 답변이 추가되었을 때 하단으로 자동 스크롤
  useEffect(() => {
    if (answerListEndRef.current) {
      answerListEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [answers]);

  if (!selectedQuestion) return null;

  // 답변 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 글 또는 이미지 중 하나만 있어도 등록 가능 (수식을 사진/펜으로만 올리는 경우 허용)
    if (!answerContent.trim() && !answerImage) {
      setErrorMsg("답변 내용을 입력하거나 이미지를 첨부해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      await onAddAnswer(selectedQuestion.id, answerContent, answerImage);
      setAnswerContent("");
      setAnswerImage(null);
      setErrorMsg("");
    } catch (err) {
      console.error(err);
      setErrorMsg("답변 등록에 실패했습니다. " + (err?.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  // 시간 포맷 유틸리티
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // 본인 질문 삭제 (답변도 함께 삭제됨)
  const handleDeleteQuestion = async () => {
    if (!window.confirm("이 질문을 삭제할까요? 달린 답변도 함께 삭제됩니다.")) return;
    try {
      await onDeleteQuestion(selectedQuestion);
    } catch (err) {
      console.error(err);
      setErrorMsg("삭제에 실패했습니다. " + (err?.message || ""));
    }
  };

  // 본인 답변 삭제
  const handleDeleteAnswer = async (ans) => {
    if (!window.confirm("이 답변을 삭제할까요?")) return;
    try {
      await onDeleteAnswer(ans);
    } catch (err) {
      console.error(err);
      setErrorMsg("삭제에 실패했습니다. " + (err?.message || ""));
    }
  };

  // 본인 글 여부
  const isMyQuestion = currentUser && selectedQuestion.userId === currentUser.userId;

  return (
    <div style={drawerBackdropStyle} onClick={onClose}>
      <div
        style={drawerContainerStyle}
        onClick={(e) => e.stopPropagation()} // 이벤트 버블링(부모 클릭 전파) 차단
      >
        {/* 1. 헤더 영역 */}
        <header style={headerStyle}>
          <div style={headerTitleStyle}>
            <MessageCircle size={16} color="#a78bfa" style={{ marginRight: 6 }} />
            <span>질문 답변 스레드</span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </header>

        {/* 2. 스크롤 내용 영역 */}
        <div style={scrollContentStyle}>
          {/* 질문 메인 글 카드 */}
          <section style={questionCardStyle}>
            <div style={authorMetaStyle}>
              <img
                src={selectedQuestion.userProfile}
                alt={selectedQuestion.userName}
                style={avatarStyle}
              />
              <div>
                <span style={authorNameStyle}>{selectedQuestion.userName}</span>
                <span style={timeTextStyle}>
                  <Clock size={11} style={{ marginRight: 3 }} />
                  {formatTime(selectedQuestion.createdAt)}
                </span>
              </div>
              {isMyQuestion && (
                <button onClick={handleDeleteQuestion} style={deleteBtnStyle} title="질문 삭제">
                  <Trash2 size={14} style={{ marginRight: 4 }} />
                  삭제
                </button>
              )}
            </div>

            <h3 style={titleStyle}>{selectedQuestion.title}</h3>
            <p style={contentStyle}>{selectedQuestion.content}</p>

            {selectedQuestion.imageUrl && (
              <a href={selectedQuestion.imageUrl} target="_blank" rel="noreferrer">
                <img src={selectedQuestion.imageUrl} alt="첨부 이미지" style={attachImageStyle} />
              </a>
            )}

            <div style={tagContainerStyle}>
              {selectedQuestion.keywords.map((tag) => (
                <span key={tag} className="tag-badge">
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <hr style={dividerStyle} />

          {/* 답변 리스트 */}
          <section style={answersSectionStyle}>
            <h4 style={answersTitleStyle}>답변 목록 ({answers.length})</h4>
            
            {answers.length === 0 ? (
              <div style={emptyAnswersStyle}>
                <ShieldAlert size={28} color="#6b7280" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  아직 작성된 답변이 없습니다.
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: 2 }}>
                  이해를 돕는 답변을 달아 친구를 도와주세요!
                </p>
              </div>
            ) : (
              <div style={answersListStyle}>
                {answers.map((ans) => (
                  <div key={ans.id} style={answerCardStyle}>
                    <div style={answerMetaStyle}>
                      <img src={ans.userProfile} alt={ans.userName} style={smallAvatarStyle} />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={answerAuthorStyle}>{ans.userName}</span>
                        <span style={answerTimeStyle}>{formatTime(ans.createdAt)}</span>
                      </div>
                      {currentUser && ans.userId === currentUser.userId && (
                        <button
                          onClick={() => handleDeleteAnswer(ans)}
                          style={answerDeleteBtnStyle}
                          title="답변 삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p style={answerContentStyle}>{ans.content}</p>
                    {ans.imageUrl && (
                      <a href={ans.imageUrl} target="_blank" rel="noreferrer">
                        <img src={ans.imageUrl} alt="첨부 이미지" style={attachImageStyle} />
                      </a>
                    )}
                  </div>
                ))}
                {/* 스크롤 포커싱 앵커 */}
                <div ref={answerListEndRef} />
              </div>
            )}
          </section>
        </div>

        {/* 3. 하단 답변 입력 폼 고정 */}
        <footer style={footerStyle}>
          {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
          <form onSubmit={handleSubmit} style={formStyle}>
            <textarea
              placeholder="친구를 위해 친절한 답변을 남겨주세요. (답변 작성 시 20포인트가 적립됩니다!)"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              className="input-field"
              style={textareaStyle}
            />
            <AttachmentInput attachment={answerImage} onChange={setAnswerImage} />
            <button type="submit" disabled={submitting} className="btn btn-primary" style={submitBtnStyle}>
              <Send size={14} />
              {submitting ? "등록 중..." : "답변 등록"}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

// --- 인라인 스타일 정의 (슬라이드 드로어 연출) ---
const drawerBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 100
};

const drawerContainerStyle = {
  width: "480px",
  maxWidth: "90%",
  height: "100%",
  backgroundColor: "var(--bg-secondary)",
  borderLeft: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-lg)",
  display: "flex",
  flexDirection: "column",
  animation: "slideInRight 0.3s ease-out forwards"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid var(--border-color)",
  backgroundColor: "rgba(0, 0, 0, 0.15)"
};

const headerTitleStyle = {
  fontSize: "15px",
  fontWeight: "600",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center"
};

const closeBtnStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: "4px",
  borderRadius: "6px",
  transition: "all var(--transition-fast)"
};

const scrollContentStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "20px"
};

const questionCardStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  borderRadius: "12px",
  padding: "16px",
  border: "1px solid var(--border-color)",
  marginBottom: "16px"
};

const authorMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "12px"
};

const avatarStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.05)"
};

const authorNameStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-primary)",
  display: "block"
};

const timeTextStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "11px",
  color: "var(--text-muted)",
  marginTop: "2px"
};

const titleStyle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "var(--text-primary)",
  marginBottom: "10px",
  lineHeight: "1.4"
};

const contentStyle = {
  fontSize: "13px",
  color: "var(--text-secondary)",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap", // 줄바꿈과 공백 보존 (Preserve Linebreaks)
  marginBottom: "14px"
};

const attachImageStyle = {
  display: "block",
  maxWidth: "100%",
  maxHeight: "320px",
  borderRadius: "10px",
  border: "1px solid var(--border-color)",
  margin: "4px 0 14px 0",
  cursor: "zoom-in"
};

const tagContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px"
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid var(--border-color)",
  margin: "16px 0"
};

const answersSectionStyle = {
  display: "flex",
  flexDirection: "column"
};

const answersTitleStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "var(--text-secondary)",
  marginBottom: "12px"
};

const emptyAnswersStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 0",
  textAlign: "center"
};

const answersListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const answerCardStyle = {
  padding: "12px",
  borderRadius: "10px",
  backgroundColor: "var(--bg-tertiary)",
  border: "1px solid var(--border-color)"
};

const answerMetaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px"
};

const deleteBtnStyle = {
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
  fontSize: "11px",
  color: "#f87171",
  background: "rgba(239, 68, 68, 0.08)",
  border: "1px solid rgba(239, 68, 68, 0.25)",
  padding: "5px 10px",
  borderRadius: "8px",
  cursor: "pointer"
};

const answerDeleteBtnStyle = {
  marginLeft: "auto",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#f87171",
  background: "transparent",
  border: "none",
  padding: "4px",
  borderRadius: "6px",
  cursor: "pointer"
};

const smallAvatarStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  backgroundColor: "rgba(255, 255, 255, 0.05)"
};

const answerAuthorStyle = {
  fontSize: "12px",
  fontWeight: "600",
  color: "var(--text-primary)"
};

const answerTimeStyle = {
  fontSize: "10px",
  color: "var(--text-muted)"
};

const answerContentStyle = {
  fontSize: "12px",
  color: "var(--text-secondary)",
  lineHeight: "1.5",
  whiteSpace: "pre-wrap"
};

const footerStyle = {
  padding: "16px 20px",
  borderTop: "1px solid var(--border-color)",
  backgroundColor: "rgba(0, 0, 0, 0.15)"
};

const errorStyle = {
  fontSize: "12px",
  color: "#f87171",
  marginBottom: "8px"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const textareaStyle = {
  minHeight: "70px",
  maxHeight: "150px",
  padding: "10px 12px",
  fontSize: "13px",
  resize: "vertical"
};

const submitBtnStyle = {
  alignSelf: "flex-end",
  padding: "8px 16px"
};
