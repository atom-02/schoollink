import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // preview 도구가 지정한 포트(PORT 환경변수)를 그대로 사용
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
