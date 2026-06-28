// 스쿨링크 로컬 데이터 저장 및 관리 유틸리티 (Storage Utility)

// 기본 테스트 유저 목록
const DEFAULT_USERS = {
  "user_01": {
    userId: "user_01",
    name: "김민재 (테스트 학생)",
    role: "학생",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_01",
    points: 150
  },
  "user_02": {
    userId: "user_02",
    name: "이지민 (답변 요정)",
    role: "학생",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_02",
    points: 340
  },
  "user_03": {
    userId: "user_03",
    name: "박동현 (질문 왕)",
    role: "학생",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_03",
    points: 80
  },
  "teacher_01": {
    userId: "teacher_01",
    name: "한선생님 (지도 교사)",
    role: "교사",
    profileImage: "https://api.dicebear.com/7.x/adventurer/svg?seed=teacher_01",
    points: 999
  }
};

// 기본 질문 목업 데이터
const DEFAULT_QUESTIONS = [
  {
    id: "q_1",
    userId: "user_03",
    userName: "박동현 (질문 왕)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_03",
    title: "고등 수학(상) 이차방정식 근과 계수의 관계 유도가 헷갈려요.",
    content: "이차방정식 ax^2 + bx + c = 0 의 두 근이 알파, 베타일 때 알파+베타 = -b/a 가 되는 원리가 궁금합니다. 매번 외우기만 하니까 응용문제에서 자꾸 막히네요. 수학 고수분들의 쉬운 설명 부탁드려요!",
    keywords: ["수학", "방정식"],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5시간 전
    commentsCount: 2
  },
  {
    id: "q_2",
    userId: "user_01", // 테스트 유저의 질문
    userName: "김민재 (테스트 학생)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_01",
    title: "통합과학 광합성 과정에서 명반응과 암반응의 차이가 뭔가요?",
    content: "교과서에서 빛이 필요한 반응이 명반응이고, 빛이 직접 필요 없는 반응이 암반응이라고 배웠는데, 두 반응이 일어나는 장소(엽록체 스트로마, 틸라코이드)와 에너지 흐름이 어떻게 유기적으로 연결되는지 자세히 가르쳐주세요.",
    keywords: ["과학", "생물"],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24시간 전
    commentsCount: 1
  },
  {
    id: "q_3",
    userId: "user_02",
    userName: "이지민 (답변 요정)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_02",
    title: "React의 useState를 쓸 때 비동기적 상태 변경 문제가 발생합니다.",
    content: "setState를 호출한 직후에 state 값을 콘솔에 출력하면 이전 값이 찍히는데, 리액트가 렌더링 최적화를 위해 상태 변경(State Update)을 일괄 처리(Batching)하기 때문인가요? 어떻게 해결해야 하는지 해결책을 알려주세요.",
    keywords: ["코딩", "React"],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 48시간 전
    commentsCount: 0
  }
];

// 기본 답변/댓글 목업 데이터
const DEFAULT_ANSWERS = [
  {
    id: "a_1",
    questionId: "q_1",
    userId: "user_02",
    userName: "이지민 (답변 요정)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_02",
    content: "이차방정식 ax^2 + bx + c = 0 을 a로 묶어서 인수분해식 a(x - 알파)(x - 베타) = 0 과 비교해 보세요! 이 식을 전개하면 ax^2 - a(알파+베타)x + a*알파*베타 = 0 이 되는데, 원래 식의 계수들과 비교(계수비교법)해보면 -a(알파+베타) = b가 되어서 알파+베타 = -b/a 라는 공식이 자연스럽게 유도된답니다! 근의 공식을 직접 더해보는 방법도 있어요.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4시간 전
  },
  {
    id: "a_2",
    questionId: "q_1",
    userId: "teacher_01",
    userName: "한선생님 (지도 교사)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=teacher_01",
    content: "지민 학생이 아주 훌륭한 설명을 해주었네요! 추가로 두 근의 합과 곱은 그래프 상의 대칭축(x = -b/2a)을 기준으로 대칭성을 이해할 때도 매우 유용하게 쓰이니 함께 연계해 공부해보세요.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3시간 전
  },
  {
    id: "a_3",
    questionId: "q_2",
    userId: "user_02",
    userName: "이지민 (답변 요정)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_02",
    content: "엽록체의 틸라코이드 막에서 빛을 받아 ATP와 NADPH라는 화학 에너지를 만드는 단계가 명반응이고, 이 에너지를 사용해 스트로마에서 이산화탄소를 포도당으로 합성하는 단계가 암반응(캘빈 회로)이에요. 즉, 명반응의 결과물이 암반응의 연료 역할을 한답니다!",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString() // 20시간 전
  }
];

// 기본 공지사항 목업 데이터
const DEFAULT_NOTICES = [
  {
    id: "n_1",
    userId: "teacher_01",
    userName: "한선생님 (지도 교사)",
    title: "📢 스쿨링크 오픈! 활발한 공부 교류를 응원합니다.",
    content: "학생 여러분 환영합니다! 스쿨링크는 공부하다 막히는 문제를 나누는 소통의 장입니다. 질문을 올리거나 친구의 질문에 친절한 답변을 달아주면 학습 포인트를 획득할 수 있습니다. 적극적인 참여를 부탁드립니다!",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString() // 3일 전
  },
  {
    id: "n_2",
    userId: "teacher_01",
    userName: "한선생님 (지도 교사)",
    title: "⚡ 이번 주 금요일 '과학 토론반' 실험 보조 안내",
    content: "이번 주 금요일 방과 후 과학실에서 통합과학 생물 파트 광합성 실험이 예정되어 있습니다. 실험 조장들은 미리 과학실에 와서 엽록체 추출용 비커와 스포이트를 점검해 주기 바랍니다.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12시간 전
  }
];

// 로컬 스토리지 키 정의
const KEYS = {
  USERS: "schoollink_users",
  QUESTIONS: "schoollink_questions",
  ANSWERS: "schoollink_answers",
  NOTICES: "schoollink_notices",
  CURRENT_USER_ID: "schoollink_current_user_id"
};

/**
 * 로컬 스토리지를 스쿨링크 기본 데이터로 초기화하는 함수 (상태 확인 후 최초 1회만 동작)
 */
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(KEYS.QUESTIONS)) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
  }
  if (!localStorage.getItem(KEYS.ANSWERS)) {
    localStorage.setItem(KEYS.ANSWERS, JSON.stringify(DEFAULT_ANSWERS));
  }
  if (!localStorage.getItem(KEYS.NOTICES)) {
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(DEFAULT_NOTICES));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER_ID)) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, "user_01"); // 테스트 유저 'user_01' 기본 설정
  }
};

/**
 * 현재 로그인된 유저 객체를 반환합니다.
 */
export const getCurrentUser = () => {
  initializeStorage();
  const users = JSON.parse(localStorage.getItem(KEYS.USERS));
  const currentId = localStorage.getItem(KEYS.CURRENT_USER_ID);
  return users[currentId] || DEFAULT_USERS["user_01"];
};

/**
 * 모든 질문 데이터를 가져옵니다.
 */
export const getQuestions = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.QUESTIONS));
};

/**
 * 신규 질문을 등록합니다.
 * @param {string} title 질문 제목
 * @param {string} content 질문 내용
 * @param {string[]} keywords 해시태그 목록
 */
export const addQuestion = (title, keywords, content) => {
  initializeStorage();
  const currentUser = getCurrentUser();
  const questions = getQuestions();

  const newQuestion = {
    id: `q_${Date.now()}`, // 타임스탬프를 이용한 고유 식별자 생성
    userId: currentUser.userId,
    userName: currentUser.name,
    userProfile: currentUser.profileImage,
    title: title,
    content: content,
    keywords: keywords,
    createdAt: new Date().toISOString(),
    commentsCount: 0
  };

  questions.unshift(newQuestion); // 최신 글이 맨 위에 오도록 배열의 앞에 추가 (Prepend)
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));

  // 질문 등록 시 10 포인트 적립 (동기 부여 요소)
  updateUserPoints(currentUser.userId, 10);

  return newQuestion;
};

/**
 * 특정 질문에 대한 답변 목록을 가져옵니다.
 * @param {string} questionId 질문 카드 ID
 */
export const getAnswersForQuestion = (questionId) => {
  initializeStorage();
  const allAnswers = JSON.parse(localStorage.getItem(KEYS.ANSWERS));
  return allAnswers.filter(answer => answer.questionId === questionId);
};

/**
 * 특정 질문에 답변(댓글)을 추가합니다.
 * @param {string} questionId 질문 ID
 * @param {string} content 답변 내용
 */
export const addAnswer = (questionId, content) => {
  initializeStorage();
  const currentUser = getCurrentUser();
  const allAnswers = JSON.parse(localStorage.getItem(KEYS.ANSWERS));

  const newAnswer = {
    id: `a_${Date.now()}`,
    questionId: questionId,
    userId: currentUser.userId,
    userName: currentUser.name,
    userProfile: currentUser.profileImage,
    content: content,
    createdAt: new Date().toISOString()
  };

  allAnswers.push(newAnswer);
  localStorage.setItem(KEYS.ANSWERS, JSON.stringify(allAnswers));

  // 질문 카드의 답변 개수(commentsCount)를 1 증가시킵니다.
  const questions = getQuestions();
  const updatedQuestions = questions.map(q => {
    if (q.id === questionId) {
      return { ...q, commentsCount: (q.commentsCount || 0) + 1 };
    }
    return q;
  });
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(updatedQuestions));

  // 답변 등록 시 20 포인트 적립 (동기 부여 요소)
  updateUserPoints(currentUser.userId, 20);

  return newAnswer;
};

/**
 * 모든 공지사항 목록을 가져옵니다.
 */
export const getNotices = () => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(KEYS.NOTICES));
};

/**
 * 유저의 누적 학습 포인트를 업데이트합니다.
 * @param {string} userId 사용자 ID
 * @param {number} pointsToAdd 추가할 점수
 */
const updateUserPoints = (userId, pointsToAdd) => {
  const users = JSON.parse(localStorage.getItem(KEYS.USERS));
  if (users[userId]) {
    users[userId].points = (users[userId].points || 0) + pointsToAdd;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
};
