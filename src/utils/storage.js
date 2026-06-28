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
    title: "기초수학 인수분해할 때 공통인수로 묶는 게 자꾸 헷갈려요.",
    content: "예를 들어 6x^2 + 9x 를 인수분해하면 3x(2x + 3) 이 된다는데, 공통인수 3x를 어떻게 찾는 건지 원리가 궁금합니다. 숫자랑 문자를 따로따로 봐야 하나요? 쉬운 설명 부탁드려요!",
    keywords: ["기초수학", "인수분해"],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5시간 전
    commentsCount: 2
  },
  {
    id: "q_2",
    userId: "user_01", // 테스트 유저의 질문
    userName: "김민재 (테스트 학생)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_01",
    title: "공통수학2 원의 방정식에서 중심과 반지름은 어떻게 찾나요?",
    content: "x^2 + y^2 - 4x + 6y - 3 = 0 같은 식이 주어졌을 때, 이걸 (x-a)^2 + (y-b)^2 = r^2 꼴로 어떻게 바꾸는지 모르겠어요. 완전제곱식으로 고치는 과정을 단계별로 알려주세요!",
    keywords: ["공통수학2", "원의방정식"],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24시간 전
    commentsCount: 1
  },
  {
    id: "q_3",
    userId: "user_02",
    userName: "이지민 (답변 요정)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_02",
    title: "미적분 함수의 극한에서 0/0 꼴은 어떻게 계산하나요?",
    content: "lim(x→2) (x^2-4)/(x-2) 를 계산하면 그냥 대입했을 때 0/0 이 나오는데, 이럴 때 인수분해로 약분한다고 들었어요. 왜 약분이 가능한지, 그리고 답이 왜 4가 되는지 원리가 궁금합니다.",
    keywords: ["미적분", "극한"],
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
    content: "공통인수는 각 항에 똑같이 들어있는 걸 찾으면 돼요! 6x^2와 9x에서 숫자 6과 9의 최대공약수는 3이고, 문자는 x^2와 x에 공통으로 x가 들어있죠. 그래서 공통인수는 3x! 이걸 묶어내면 3x(2x + 3)이 됩니다. 묶은 뒤 괄호 안을 다시 전개해서 원래 식이 나오는지 확인하면 검산도 돼요.",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4시간 전
  },
  {
    id: "a_2",
    questionId: "q_1",
    userId: "teacher_01",
    userName: "한선생님 (지도 교사)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=teacher_01",
    content: "동현 학생, 지민 학생 설명이 정확해요! 한 가지 팁을 더 주자면, 숫자는 '최대공약수', 문자는 '차수가 가장 낮은 것'을 기준으로 묶으면 항상 깔끔하게 인수분해된답니다. 인수분해는 앞으로 배울 모든 단원의 기본기이니 꼭 익혀두세요.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString() // 3시간 전
  },
  {
    id: "a_3",
    questionId: "q_2",
    userId: "user_02",
    userName: "이지민 (답변 요정)",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=user_02",
    content: "x^2-4x 부분은 (x-2)^2-4 로, y^2+6y 부분은 (y+3)^2-9 로 바꿔주면 돼요. 그러면 (x-2)^2-4 + (y+3)^2-9 - 3 = 0 이 되고, 상수를 우변으로 넘기면 (x-2)^2 + (y+3)^2 = 16 이 됩니다. 즉 중심은 (2, -3), 반지름은 √16 = 4 예요!",
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
