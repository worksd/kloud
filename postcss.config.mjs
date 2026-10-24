import path from 'node:path';

// Turbopack 은 플러그인을 문자열 이름으로만 받고 설정 파일을 .next 아래로 번들해서 돌리므로
// 상대경로·import.meta.url 모두 .next 기준으로 틀어진다. 빌드 cwd(프로젝트 루트) 기준 절대경로로 준다.
const projectDir = process.cwd();

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    // 다크 모드 — Tailwind 가 뽑은 무채색을 CSS 변수로 감싸 [data-theme="dark"] 에서 팔레트를 뒤집는다 (src/theme/)
    [path.join(projectDir, 'src/theme/postcss.dark.tokens.js')]: {},
  },
};

export default config;
