// 스쿨링크 데이터 접근 계층 (Supabase 백엔드)
// DB는 snake_case 컬럼을 쓰므로, 컴포넌트가 사용하던 camelCase 형태로 변환해 반환한다.
import { supabase } from "./supabase";

// --- 변환 헬퍼 ---
const mapQuestion = (q) => ({
  id: q.id,
  userId: q.user_id,
  userName: q.user_name,
  userProfile: q.user_profile,
  title: q.title,
  content: q.content,
  keywords: q.keywords || [],
  imageUrl: q.image_url || null,
  createdAt: q.created_at,
  commentsCount: q.comments_count || 0
});

const mapAnswer = (a) => ({
  id: a.id,
  questionId: a.question_id,
  userId: a.user_id,
  userName: a.user_name,
  userProfile: a.user_profile,
  content: a.content,
  imageUrl: a.image_url || null,
  createdAt: a.created_at
});

/**
 * 이미지(사진 파일 또는 펜으로 그린 그림)를 Storage에 업로드하고 공개 URL을 반환한다.
 * @param {string} userId 업로더 ID (파일 경로 구분용)
 * @param {Blob|File} blob 업로드할 이미지
 */
export const uploadAttachment = async (userId, blob) => {
  const ext = (blob.type && blob.type.split("/")[1]) || "png";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("attachments")
    .upload(path, blob, { contentType: blob.type || "image/png", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("attachments").getPublicUrl(path);
  return data.publicUrl;
};

const mapNotice = (n) => ({
  id: n.id,
  userName: n.author_name,
  title: n.title,
  content: n.content,
  createdAt: n.created_at
});

const mapProfile = (p) => ({
  userId: p.id,
  name: p.name,
  role: p.role,
  profileImage: p.avatar_url,
  points: p.points || 0
});

/**
 * 현재 로그인 사용자의 프로필을 가져온다. (DB 트리거가 가입 시 자동 생성)
 */
export const getMyProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return mapProfile(data);
};

/**
 * 모든 질문을 최신순으로 가져온다.
 */
export const getQuestions = async () => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapQuestion);
};

/**
 * 신규 질문을 등록한다. 작성자 정보는 현재 프로필에서 가져온다.
 * 포인트 적립(+10)은 DB 트리거가 자동 처리한다.
 */
export const addQuestion = async (currentUser, title, keywords, content, imageBlob) => {
  let imageUrl = null;
  if (imageBlob) {
    imageUrl = await uploadAttachment(currentUser.userId, imageBlob);
  }
  const { data, error } = await supabase
    .from("questions")
    .insert({
      user_id: currentUser.userId,
      user_name: currentUser.name,
      user_profile: currentUser.profileImage,
      title,
      content,
      keywords,
      image_url: imageUrl
    })
    .select()
    .single();
  if (error) throw error;
  return mapQuestion(data);
};

/**
 * 특정 질문의 답변 목록을 시간순으로 가져온다.
 */
export const getAnswersForQuestion = async (questionId) => {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapAnswer);
};

/**
 * 답변을 등록한다. 답변수 증가(+1)와 포인트 적립(+20)은 DB 트리거가 자동 처리한다.
 */
export const addAnswer = async (currentUser, questionId, content, imageBlob) => {
  let imageUrl = null;
  if (imageBlob) {
    imageUrl = await uploadAttachment(currentUser.userId, imageBlob);
  }
  const { data, error } = await supabase
    .from("answers")
    .insert({
      question_id: questionId,
      user_id: currentUser.userId,
      user_name: currentUser.name,
      user_profile: currentUser.profileImage,
      content,
      image_url: imageUrl
    })
    .select()
    .single();
  if (error) throw error;
  return mapAnswer(data);
};

/**
 * 공지사항 목록을 최신순으로 가져온다.
 */
export const getNotices = async () => {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapNotice);
};

/**
 * 현재 사용자의 활동 통계(작성 질문 수, 작성 답변 수)를 가져온다.
 */
export const getMyStats = async (userId) => {
  const [{ count: qCount }, { count: aCount }] = await Promise.all([
    supabase.from("questions").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("answers").select("*", { count: "exact", head: true }).eq("user_id", userId)
  ]);
  return { questionsCount: qCount || 0, answersCount: aCount || 0 };
};
