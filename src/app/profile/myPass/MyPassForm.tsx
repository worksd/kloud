'use client'

import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { isActivePassStatus, PassListRow } from "@/app/profile/myPass/PassListRow";
import BackArrowIcon from "../../../../public/assets/ic_back_arrow.svg";

// 섹션 헤더 + 행 리스트 — 수강 내역(TicketSection)과 동일 구조
const PassSection = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
  <section className="pb-2">
    <div className="flex items-baseline gap-2 px-5 pt-5 pb-1">
      <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{title}</h2>
      <span className="text-[13px] font-semibold text-[#B0B8C1] font-paperlogy">{count}</span>
    </div>
    <div className="flex flex-col divide-y divide-[#F2F4F6]">{children}</div>
  </section>
);

// 패스권 목록 — 탭 대신 보유 패스 / 지난 패스 두 섹션으로 한 화면에. 수강 내역 목록과 같은 톤.
export const MyPassForm = ({passes, locale}: {
  passes: GetPassResponse[],
  locale: Locale,
}) => {
  const activePasses = passes.filter((p) => isActivePassStatus(p.status));
  const usedPasses = passes.filter((p) => !isActivePassStatus(p.status));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header: Back Arrow + Title */}
      <div className="flex flex-row items-center gap-3 px-5 pt-4 pb-3 flex-shrink-0">
        <button onClick={() => (window as any).KloudEvent?.back()} className="flex items-center justify-start flex-shrink-0 -ml-1 p-1">
          <BackArrowIcon className="w-6 h-6 text-[#191F28]"/>
        </button>
        <span className="text-[20px] text-[#191F28] font-bold tracking-[-0.4px]">
          {getLocaleString({locale, key: 'my_pass'})}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {passes.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-4">
            <p className="text-[14px] text-[#8B95A1] text-center whitespace-pre-line">
              {getLocaleString({locale, key: 'no_active_passes_message'})}
            </p>
          </div>
        ) : (
          <>
            {activePasses.length > 0 && (
              <PassSection title={getLocaleString({locale, key: 'my_active_passes'})} count={activePasses.length}>
                {activePasses.map((p) => <PassListRow key={p.id} pass={p} locale={locale}/>)}
              </PassSection>
            )}
            {usedPasses.length > 0 && (
              <PassSection title={getLocaleString({locale, key: 'my_used_passes'})} count={usedPasses.length}>
                {usedPasses.map((p) => <PassListRow key={p.id} pass={p} locale={locale}/>)}
              </PassSection>
            )}
          </>
        )}
      </div>
    </div>
  )
}
