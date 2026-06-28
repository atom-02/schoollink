// Supabase 클라이언트 초기화
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 환경변수가 비어 있으면 빌드/실행 시 바로 알 수 있도록 경고
  console.error(
    "[스쿨링크] Supabase 환경변수가 설정되지 않았습니다. .env.local 의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 를 확인하세요."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
