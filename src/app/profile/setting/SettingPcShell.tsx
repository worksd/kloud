import React from "react";

// 설정 하위 페이지 공용 PC 셸 — 웹 직접 접근 + viewport ≥1024px(lg)이면 회색 배경 중앙 카드,
// 그 외(앱 웹뷰/좁은 웹)는 기존(mobile) 렌더. 둘 다 SSR 후 CSS 토글 (다른 상세 페이지들과 동일 패턴).
export const SettingPcShell = ({isWeb, title, flush = false, children, mobile}: {
  isWeb: boolean;
  title?: string;
  /** 메뉴 리스트처럼 항목이 자체 px-6 패딩을 가질 때 — 카드 좌우 패딩 없이 */
  flush?: boolean;
  /** PC 카드 안에 넣을 컨텐츠 */
  children: React.ReactNode;
  /** 기존 모바일/앱 렌더 */
  mobile: React.ReactNode;
}) => {
  if (!isWeb) return <>{mobile}</>;
  return (
    <>
      <div className="hidden lg:block">
        <div className="w-full min-h-screen bg-[#f9f9fb] pt-12 pb-24">
          <div className="mx-auto w-full max-w-[680px] px-8">
            <section className={`rounded-2xl border border-[#f0f1f3] bg-white overflow-hidden ${flush ? 'pt-4 pb-2' : 'p-6'}`}>
              {title && <h1 className={`text-[18px] font-bold text-black ${flush ? 'px-6 pt-2 pb-3' : 'mb-5'}`}>{title}</h1>}
              {children}
            </section>
          </div>
        </div>
      </div>
      <div className="lg:hidden">{mobile}</div>
    </>
  );
};
