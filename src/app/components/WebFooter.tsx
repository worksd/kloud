// PC 웹 전 페이지 공통 푸터 — 회사 정보 법적 표기. 서버 컴포넌트 (SSR부터 존재 — hydration 팝인 없음).
// 웹/앱·/kiosk 노출 판단은 layout(x-guinness-version/entry 헤더)이 한다.
// 값·문구는 src/shared/company.ts 단일 출처 — 파트너스 웹 사이드바 푸터와 같은 형식(라벨 ' : ' 값).
// .web-footer: 라우트 전환(loading.tsx) 중 globals.css body:has 규칙이 숨긴다 — 깜빡임 방지.

import { COMPANY_INFO, LEGAL_LINKS } from '@/shared/company';

export const WebFooter = () => {
  return (
    <footer className="web-footer hidden lg:block border-t border-[#f0f1f3] bg-[#fafbfc]">
      {/* 중앙 정렬 없이 뷰포트 왼쪽에 붙인다 — 회사 정보 푸터의 통상 배치 */}
      <div className="w-full px-8 py-10 flex flex-col gap-5">
        {/* 링크 — 개인정보 처리방침은 관례상 이용약관보다 굵게 */}
        <div className="flex items-center gap-2 text-[13px]">
          <a
            href={LEGAL_LINKS.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#4E5968] hover:text-black transition-colors"
          >
            개인정보 처리방침
          </a>
          <span className="text-[#D1D5DB]">·</span>
          <a
            href={LEGAL_LINKS.terms}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#6D7882] hover:text-black transition-colors"
          >
            이용약관
          </a>
        </div>

        {/* 회사 정보 — 상호·주소는 라벨 없이, 나머지는 '라벨 : 값' (파트너스 웹과 동일 문구).
            메타 항목은 한 줄에 2개씩 '|' 구분, 주소는 길어서 단독 줄 */}
        <div className="flex flex-col gap-1 text-[12px] leading-relaxed text-[#8A949E]">
          <span className="font-medium text-[#6D7882]">{COMPANY_INFO.name}</span>
          <span>
            대표자명 : {COMPANY_INFO.representative}
            <span className="mx-2 text-[#D1D5DB]">|</span>
            사업자번호 : {COMPANY_INFO.businessRegistrationNumber}
          </span>
          <span>
            통신판매업신고 : {COMPANY_INFO.eCommerceRegNumber}
            <span className="mx-2 text-[#D1D5DB]">|</span>
            고객센터 : {COMPANY_INFO.customerServicePhone}
          </span>
          <span>{COMPANY_INFO.address}</span>
        </div>

        <span className="text-[12px] text-[#B0B8BF]">
          © {new Date().getFullYear()} {COMPANY_INFO.copyrightName} All rights reserved.
        </span>
      </div>
    </footer>
  );
};
