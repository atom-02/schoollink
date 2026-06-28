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
  getNotices,
  getMyStats
} from "./lib/api";
import { GraduationCap, LogOut } from "lucide-react";
import "./App.css";

export default function App() {
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
          <GraduationCap size={28} color="#a78bfa" style={{ marginRight: 10 }} />
          <h1 style={logoTextStyle}>스쿨링크 <span>SchoolLink</span></h1>
        </div>
        <div style={headerInfoStyle}>
          <div style={onlineBadgeStyle}>
            <span style={dotStyle}></span>
            <span>자기주도 학습 매칭 활성화 중</span>
          </div>
          <button onClick={handleSignOut} style={logoutBtnStyle} title="로그아웃">
            <LogOut size={15} style={{ marginRight: 6 }} />
            로그아웃
          </button>
        </div>
      </header>

      {/* 2. 하단 메인 3단 레이아웃 콘텐츠 */}
      <div style={appContentStyle}>
        <Sidebar
          currentUser={currentUser}
          selectedKeyword={selectedKeyword}
          onSelectKeyword={handleSelectKeyword}
          keywords={keywords}
        />

        <MainFeed
          questions={questions}
          selectedKeyword={selectedKeyword}
          onSelectQuestion={handleSelectQuestion}
          onAddQuestion={handleAddQuestion}
        />

        <RightPanel
          notices={notices}
          currentUser={currentUser}
          questionsCount={myQuestionsCount}
          answersCount={myAnswersCount}
        />
      </div>

      {/* [상세보기 스레드] 우측 슬라이드 패널 */}
      {selectedQuestion && (
        <DetailPanel
          selectedQuestion={selectedQuestion}
          answers={currentAnswers}
          onClose={handleCloseDetail}
          onAddAnswer={handleAddAnswer}
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
  height: "100vh",
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)"
};

const appWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100vw",
  height: "100vh",
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
