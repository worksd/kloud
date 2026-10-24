import type { Config } from "tailwindcss";
import scrollbarHide from 'tailwind-scrollbar-hide';

const config: Config = {
  // 다크 모드는 <html data-theme="dark"> 로 켠다 (전역 팔레트 치환은 src/theme/ PostCSS 플러그인).
  // 개별 조정이 필요하면 dark: 변형을 쓸 수 있다.
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 10s linear infinite',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' }
        }
      },
      fontFamily: {
        paperlogy: ['var(--font-paperlogy)']
      },
    },
  },
  plugins: [
    scrollbarHide
  ],
};
export default config;
