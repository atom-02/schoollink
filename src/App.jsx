import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainFeed from "./components/MainFeed";
import RightPanel from "./components/RightPanel";
import DetailPanel from "./components/DetailPanel";
import Login from "./components/Login";
import { supabase } from "./lib/supabase";
import {
  getMyProfile,
  getQuestions,
  addQuestion,
  getAnswersForQuestion,
  addAnswer,
  deleteQuestion,
  deleteAnswer,
  getNotices,
  getMyStats
} from "./lib/api";
import { useIsMobile } from "./lib/useIsMobile";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import "./App.css";

export default function App() {
  // 반응형: 좁은 화면이면 모바일 레이아웃
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  // 인증 상태
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 앱 데이터 상태
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [notices, setNotices] = useState([]);

  const [selectedKeyword, setSelectedKeyword] = useState("전체");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]);

  // 사용자의 작성 통계
  const [myQuestionsCount, setMyQuestionsCount] = useState(0);
  const [myAnswersCount, setMyAnswersCount] = useState(0);

  // 과목 키워드 목록
  const keywords = ["전체", "기초수학", "공통수학2", "미적분"];

  // 1) 세션 추적: 최초 세션 확인 + 로그인/로그아웃 이벤트 구독
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2) 세션이 생기면 앱 데이터 로드, 로그아웃되면 초기화
  useEffect(() => {
    if (session?.user) {
      loadAppData(session.user.id);
    } else {
      setCurrentUser(null);
      setQuestions([]);
      setNotices([]);
    }
  }, [session]);

  // 3) 상세 보기가 바뀌면 해당 질문의 답변 목록 갱신
  useEffect(() => {
    let active = true;
    if (selectedQuestion) {
      getAnswersForQuestion(selectedQuestion.id).then((ans) => {
        if (active) setCurrentAnswers(ans);
      });
    } else {
      setCurrentAnswers([]);
    }
    return () => {
      active = false;
    };
  }, [selectedQuestion]);

  // Supabase로부터 최신 상태를 읽어오는 함수
  const loadAppData = async (userId) => {
    try {
      const [profile, allQuestions, allNotices, stats] = await Promise.all([
        getMyProfile(userId),
        getQuestions(),
        getNotices(),
        getMyStats(userId)
      ]);
      setCurrentUser(profile);
      setQuestions(allQuestions);
      setNotices(allNotices);
      setMyQuestionsCount(stats.questionsCount);
      setMyAnswersCount(stats.answersCount);
    } catch (e) {
      console.error("[스쿨링크] 데이터 로드 실패:", e);
    }
  };

  const refresh = async () => {
    if (session?.user) await loadAppData(session.user.id);
  };

  // 키워드 필터 선택
  const handleSelectKeyword = (keyword) => {
    setSelectedKeyword(keyword);
    setSelectedQuestion(null);
    setMenuOpen(false); // 모바일 메뉴에서 선택 시 닫기
  };

  const handleSelectQuestion = (question) => setSelectedQuestion(question);
  const handleCloseDetail = () => setSelectedQuestion(null);

  // 신규 질문 등록 (포인트 적립은 DB 트리거가 처리)
  const handleAddQuestion = async (title, kws, content, image) => {
    await addQuestion(currentUser, title, kws, content, image);
    await refresh();
  };

  // 신규 답변 등록 (답변수/포인트는 DB 트리거가 처리)
  const handleAddAnswer = async (questionId, content, image) => {
    await addAnswer(currentUser, questionId, content, image);
    const ans = await getAnswersForQuestion(questionId);
    setCurrentAnswers(ans);
    await refresh();
  };

  // 본인 질문 삭제
  const handleDeleteQuestion = async (question) => {
    await deleteQuestion(question);
    setSelectedQuestion(null); // 상세 닫기
    await refresh();
  };

  // 본인 답변 삭제
  const handleDeleteAnswer = async (answer) => {
    await deleteAnswer(answer);
    const ans = await getAnswersForQuestion(answer.questionId);
    setCurrentAnswers(ans);
    await refresh();
  };

  // 로그아웃
  const handleSignOut = async () => {
    setSelectedQuestion(null);
    await supabase.auth.signOut();
  };

  // --- 렌더 게이트 ---
  if (authLoading) {
    return (
      <div style={loadingContainerStyle}>
        <p>스쿨링크 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 로그인 안 됨 → 로그인 화면
  if (!session) {
    return <Login />;
  }

  // 로그인은 됐지만 프로필 로딩 전
  if (!currentUser) {
    return (
      <div style={loadingContainerStyle}>
        <p>프로필 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div style={appWrapperStyle}>
      {/* 1. 상단 글로벌 헤더 */}
      <header className="glass-panel" style={appHeaderStyle}>
        <div style={logoAreaStyle}>
          {isMobile && (
            <button onClick={() => setMenuOpen(true)} style={menuBtnStyle} title="메뉴">
              <Menu size={22} />
            </button>
          )}
          <GraduationCap size={28} color="#a78bfa" style={{ marginRight: 10 }} />
          <h1 style={logoTextStyle}>스쿨링크 <span>SchoolLink</span></h1>
        </div>
        <div style={headerInfoStyle}>
          {!isMobile && (
            <div style={onlineBadgeStyle}>
              <span style={dotStyle}></span>
              <span>자기주도 학습 매칭 활성화 중</span>
            </div>
          )}
          <button onClick={handleSignOut} style={logoutBtnStyle} title="로그아웃">
            <LogOut size={15} style={isMobile ? {} : { marginRight: 6 }} />
            {!isMobile && "로그아웃"}
          </button>
        </div>
      </header>

      {/* 2. 메인 콘텐츠: 데스크톱은 3단, 모바일은 피드 전체 폭 */}
      <div style={appContentStyle}>
        {!isMobile && (
          <Sidebar
            currentUser={currentUser}
            selectedKeyword={selectedKeyword}
            onSelectKeyword={handleSelectKeyword}
            keywords={keywords}
          />
        )}

        <MainFeed
          questions={questions}
          selectedKeyword={selectedKeyword}
          onSelectQuestion={handleSelectQuestion}
          onAddQuestion={handleAddQuestion}
          mobile={isMobile}
        />

        {!isMobile && (
          <RightPanel
            notices={notices}
            currentUser={currentUser}
            questionsCount={myQuestionsCount}
            answersCount={myAnswersCount}
          />
        )}
      </div>

      {/* 모바일 메뉴 서랍: 프로필/과목 + 공지/대시보드 */}
      {isMobile && menuOpen && (
        <div style={menuBackdropStyle} onClick={() => setMenuOpen(false)}>
          <div style={menuDrawerStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMenuOpen(false)} style={menuCloseStyle} title="닫기">
              <X size={20} />
            </button>
            <Sidebar
              currentUser={currentUser}
              selectedKeyword={selectedKeyword}
              onSelectKeyword={handleSelectKeyword}
              keywords={keywords}
              mobile
            />
            <RightPanel
              notices={notices}
              currentUser={currentUser}
              questionsCount={myQuestionsCount}
              answersCount={myAnswersCount}
              mobile
            />
          </div>
        </div>
      )}

      {/* [상세보기 스레드] 슬라이드 패널 (토글형) */}
      {selectedQuestion && (
        <DetailPanel
          selectedQuestion={selectedQuestion}
          answers={currentAnswers}
          currentUser={currentUser}
          mobile={isMobile}
          onClose={handleCloseDetail}
          onAddAnswer={handleAddAnswer}
          onDeleteQuestion={handleDeleteQuestion}
          onDeleteAnswer={handleDeleteAnswer}
        />
      )}
    </div>
  );
}

// --- 인라인 스타일 정의 ---
const loadingContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100vw",
  height: "100dvh",
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)"
};

const appWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100vw",
  height: "100dvh",
  overflow: "hidden",
  backgroundColor: "var(--bg-primary)"
};

const appHeaderStyle = {
  height: "64px",
  minHeight: "64px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  borderBottom: "1px solid var(--border-color)",
  backgroundColor: "rgba(22, 23, 32, 0.8)",
  zIndex: 20
};

const logoAreaStyle = {
  display: "flex",
  alignItems: "center"
};

const logoTextStyle = {
  fontSize: "20px",
  fontWeight: "800",
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "baseline",
  gap: "6px"
};

const headerInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px"
};

const onlineBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12px",
  backgroundColor: "rgba(16, 185, 129, 0.08)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  padding: "4px 12px",
  borderRadius: "9999px",
  color: "#34d399"
};

const dotStyle = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#10b981",
  boxShadow: "0 0 8px #10b981"
};

const logoutBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "12px",
  color: "var(--text-secondary)",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid var(--border-color)",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all var(--transition-fast)"
};

const appContentStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "row",
  width: "100%",
  height: "calc(100% - 64px)",
  overflow: "hidden"
};

// --- 모바일 전용 스타일 ---
const menuBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  color: "var(--text-primary)",
  cursor: "pointer",
  padding: "4px",
  marginRight: "8px"
};

const menuBackdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100dvh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "flex-start",
  zIndex: 150
};

const menuDrawerStyle = {
  position: "relative",
  width: "84vw",
  maxWidth: "340px",
  height: "100%",
  backgroundColor: "var(--bg-secondary)",
  borderRight: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-lg)",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  animation: "slideInLeft 0.25s ease-out forwards"
};

const menuCloseStyle = {
  position: "absolute",
  top: "12px",
  right: "12px",
  zIndex: 2,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid var(--border-color)",
  color: "var(--text-secondary)",
  cursor: "pointer",
  borderRadius: "8px",
  padding: "5px",
  display: "flex"
};
