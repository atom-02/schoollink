import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainFeed from "./components/MainFeed";
import RightPanel from "./components/RightPanel";
import DetailPanel from "./components/DetailPanel";
import {
  initializeStorage,
  getCurrentUser,
  getQuestions,
  addQuestion,
  getAnswersForQuestion,
  addAnswer,
  getNotices
} from "./utils/storage";
import { BookOpen, GraduationCap } from "lucide-react";
import "./App.css";

export default function App() {
  // 상태 변수 정의
  const [currentUser, setCurrentUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [notices, setNotices] = useState([]);
  
  const [selectedKeyword, setSelectedKeyword] = useState("전체");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  
  // 사용자의 작성 통계
  const [myQuestionsCount, setMyQuestionsCount] = useState(0);
  const [myAnswersCount, setMyAnswersCount] = useState(0);

  // 과목 키워드 목록 정의
  const keywords = ["전체", "기초수학", "공통수학2", "미적분"];

  // 최초 로드 시 데이터 초기화 및 상태 로드
  useEffect(() => {
    // 로컬 스토리지 초기화 및 기본값 설정
    initializeStorage();
    loadAppData();
  }, []);

  // 활성화된 질문(상세 보기)이 변경될 때마다 답변 목록 갱신
  useEffect(() => {
    if (selectedQuestion) {
      const answers = getAnswersForQuestion(selectedQuestion.id);
      setCurrentAnswers(answers);
    } else {
      setCurrentAnswers([]);
    }
  }, [selectedQuestion, questions]);

  // 로컬 스토리지로부터 최신 애플리케이션 상태를 읽어오는 함수
  const loadAppData = () => {
    const user = getCurrentUser();
    const allQuestions = getQuestions();
    const allNotices = getNotices();

    setCurrentUser(user);
    setQuestions(allQuestions);
    setNotices(allNotices);

    // 로그인된 유저(user_01)의 통계 계산
    if (user) {
      // 1) 내가 쓴 질문 수 계산
      const myQCount = allQuestions.filter(q => q.userId === user.userId).length;
      setMyQuestionsCount(myQCount);

      // 2) 내가 쓴 답변 수 계산
      const allAnswersRaw = localStorage.getItem("schoollink_answers");
      if (allAnswersRaw) {
        const allAnswers = JSON.parse(allAnswersRaw);
        const myACount = allAnswers.filter(a => a.userId === user.userId).length;
        setMyAnswersCount(myACount);
      }
    }
  };

  // 키워드 필터 선택 핸들러
  const handleSelectKeyword = (keyword) => {
    setSelectedKeyword(keyword);
    // 키워드가 바뀌면 혹시 열려있던 상세 스레드는 닫아줌
    setSelectedQuestion(null);
  };

  // 질문 카드 클릭 핸들러 (상세 보기 오픈)
  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
  };

  // 상세 보기 창 닫기 핸들러
  const handleCloseDetail = () => {
    setSelectedQuestion(null);
  };

  // 신규 질문 등록 핸들러
  const handleAddQuestion = (title, keywords, content) => {
    addQuestion(title, keywords, content);
    // 상태 리로드 (목록 갱신 및 포인트 적립 반영)
    loadAppData();
  };

  // 신규 답변 등록 핸들러
  const handleAddAnswer = (questionId, content) => {
    addAnswer(questionId, content);
    // 상태 리로드 (댓글 목록 갱신 및 포인트 적립 반영)
    loadAppData();
  };

  if (!currentUser) {
    return (
      <div style={loadingContainerStyle}>
        <p>스쿨링크 정보를 불러오는 중입니다...</p>
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
        </div>
      </header>

      {/* 2. 하단 메인 3단 레이아웃 콘텐츠 */}
      <div style={appContentStyle}>
        {/* [1단] 좌측 패널: 프로필 및 과목 키워드 */}
        <Sidebar
          currentUser={currentUser}
          selectedKeyword={selectedKeyword}
          onSelectKeyword={handleSelectKeyword}
          keywords={keywords}
        />

        {/* [2단] 중앙 패널: 질문 카드 피드 및 등록 */}
        <MainFeed
          questions={questions}
          selectedKeyword={selectedKeyword}
          onSelectQuestion={handleSelectQuestion}
          onAddQuestion={handleAddQuestion}
        />

        {/* [3단] 우측 패널: 학급 공지 및 개인 대시보드 */}
        <RightPanel
          notices={notices}
          currentUser={currentUser}
          questionsCount={myQuestionsCount}
          answersCount={myAnswersCount}
        />
      </div>

      {/* [상세보기 스레드] 우측 슬라이드 패널 (토글형) */}
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

// --- 인라인 스타일 정의 (3단 구조의 최상단 정렬) ---
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

// 로고 속의 영문 폰트 스타일링
const logoSubStyle = {
  fontSize: "12px",
  fontWeight: "400",
  color: "var(--text-secondary)",
  textTransform: "uppercase"
};

const headerInfoStyle = {
  display: "flex",
  alignItems: "center"
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

const appContentStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "row", // 3단을 가로로 배치 (Horizontal alignment)
  width: "100%",
  height: "calc(100% - 64px)", // 헤더 높이를 제외한 영역 점유
  overflow: "hidden"
};
