'use client'

import { DayOfWeek, LessonPricePolicyResponse } from "@/app/endpoint/payment.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// 방식별 요일 표기 — '매주 월·수' 형태. 요일이 없는 방식은 표기하지 않는다.
const DAY_LABEL: Record<Locale, Record<DayOfWeek, string>> = {
  ko: { SUN: '일', MON: '월', TUE: '화', WED: '수', THU: '목', FRI: '금', SAT: '토' },
  en: { SUN: 'Sun', MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat' },
  jp: { SUN: '日', MON: '月', TUE: '火', WED: '水', THU: '木', FRI: '金', SAT: '土' },
  zh: { SUN: '日', MON: '一', TUE: '二', WED: '三', THU: '四', FRI: '五', SAT: '六' },
};
const WEEKLY_PREFIX: Record<Locale, (days: string) => string> = {
  ko: (d) => `매주 ${d}`,
  en: (d) => `Every ${d}`,
  jp: (d) => `毎週${d}`,
  zh: (d) => `每周${d}`,
};

const DOW_ORDER: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// 결제 응답은 'MON' 문자열, 수업 상세 응답은 숫자(0=일~6=토) — 둘 다 문자열 코드로 정규화
const toDow = (d: DayOfWeek | number): DayOfWeek | undefined =>
  typeof d === 'number' ? DOW_ORDER[d] : d;

/** '매주 월·수' 표기 — 요일이 없는 방식은 null. 키오스크 상세 등에서도 재사용. */
export const weeklyDaysLabel = (policy: Pick<LessonPricePolicyResponse, 'days'>, locale: Locale): string | null => {
  const days = (policy.days ?? []).map(toDow).filter((d): d is DayOfWeek => d != null);
  if (days.length === 0) return null;
  const sorted = [...days].sort((a, b) => DOW_ORDER.indexOf(a) - DOW_ORDER.indexOf(b));
  return WEEKLY_PREFIX[locale](sorted.map((d) => DAY_LABEL[locale][d]).join('·'));
};

/**
 * 수업 가격 정책 선택 섹션 — 한 수업을 '월 4회'/'월 8회' 등 여러 방식으로 살 수 있을 때 노출.
 * 선택한 정책의 paymentId로 결제하고, 해당 옵션의 price가 상품 가격이 된다.
 *
 * 총액과 함께 회당 가격을 비교 축으로 노출한다 (회당가격은 price/lessonCount 파생) —
 * 헤더 카피는 중립('수강 횟수 선택')이지만 회당가로 다회권의 이득은 자연스럽게 드러난다.
 * 정렬은 서버가 lessonCount 오름차순으로 보장하므로 여기서 재정렬하지 않는다.
 * 할인율·정가·배지는 2026-08-08 계약 변경으로 삭제됐다 — 표시하지 않는다.
 */
export const PricePolicySection = ({
  locale,
  policies,
  selectedPolicyId,
  onSelectPolicy,
}: {
  locale: Locale,
  policies: LessonPricePolicyResponse[],
  selectedPolicyId?: number,
  onSelectPolicy: (policy: LessonPricePolicyResponse) => void,
}) => {
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({ locale, key: 'won' });
  const timesUnit = getLocaleString({ locale, key: 'times_unit' });

  // name이 비어서 오면 회차 수로 폴백해 빈 라벨이 찍히지 않게 한다 (서버 기본값과 같은 '{N}회' 형식).
  const labelOf = (p: LessonPricePolicyResponse) => p.name || `${p.lessonCount}${timesUnit}`;
  const perSession = (p: LessonPricePolicyResponse) => Math.round(p.price / Math.max(p.lessonCount, 1));

  return (
    <div className="flex flex-col gap-y-2 px-6 my-3">
      <div className="text-[15px] font-bold text-black">
        {getLocaleString({ locale, key: 'select_lesson_count' })}
      </div>

      <div className="flex flex-col gap-2.5">
        {policies.map((policy) => {
          const isSelected = policy.id === selectedPolicyId;
          // usable === false만 구매 불가 — 구응답(필드 없음)은 구매 가능으로 취급
          const unusable = policy.usable === false;
          const daysLabel = weeklyDaysLabel(policy, locale);

          return (
            <button
              key={policy.id}
              type="button"
              onClick={() => { if (!unusable) onSelectPolicy(policy); }}
              aria-pressed={isSelected}
              aria-disabled={unusable}
              className={`relative w-full text-left rounded-2xl px-5 py-4 transition-all duration-200 select-none
                ${unusable
                  ? 'border border-[#EEEFF0] bg-[#FAFAFA] cursor-not-allowed'
                  : isSelected
                    ? 'border-[1.5px] border-black bg-black shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-[0.98]'
                    : 'border border-[#EEEFF0] bg-white active:scale-[0.98]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${isSelected ? 'border-white bg-white' : 'border-[#D1D5DB]'}`}>
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>

                  <span className="flex flex-col min-w-0">
                    <span className={`text-[15px] font-bold ${unusable ? 'text-[#B0B8BF]' : isSelected ? 'text-white' : 'text-black'}`}>
                      {labelOf(policy)}
                    </span>
                    {/* 방식이 다니는 요일 — 방식 선택이 곧 요일 선택이라 명시한다 */}
                    {daysLabel && (
                      <span className={`text-[12px] font-medium truncate ${unusable ? 'text-[#C4C9CF]' : isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                        {daysLabel}
                      </span>
                    )}
                    {policy.description && (
                      <span className={`text-[12px] font-medium truncate ${unusable ? 'text-[#C4C9CF]' : isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                        {policy.description}
                      </span>
                    )}
                  </span>
                </div>

                <span className="flex flex-col items-end flex-shrink-0">
                  <span className={`text-[16px] font-bold ${unusable ? 'text-[#B0B8BF]' : isSelected ? 'text-white' : 'text-black'}`}>
                    {fmt(policy.price)}{won}
                  </span>
                  {/* 옵션마다 총액 규모가 달라서, 회당 가격이 있어야 실제 이득이 읽힌다 */}
                  {policy.lessonCount > 1 && (
                    <span className={`text-[11px] font-medium ${unusable ? 'text-[#C4C9CF]' : isSelected ? 'text-white/60' : 'text-[#86898C]'}`}>
                      {getLocaleString({ locale, key: 'price_per_session' })} {fmt(perSession(policy))}{won}
                    </span>
                  )}
                </span>
              </div>

              {/* 구매 불가 사유 — 서버가 로케일 문구를 그대로 내려준다 */}
              {unusable && policy.reason && (
                <div className="mt-2.5 pt-2.5 border-t border-[#EEEFF0]">
                  <span className="text-[12px] font-medium text-[#E5484D]">{policy.reason}</span>
                </div>
              )}

              {/* 미루기 한도는 선택된 옵션에서만 펼친다 — 접힌 카드가 조용해야 비교가 쉽다 */}
              {isSelected && policy.postponeLimit != null && (
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-end">
                  <span className="text-[11px] font-medium text-white/60">
                    {getLocaleString({ locale, key: 'postpone_limit_notice' }).replace('{count}', String(policy.postponeLimit))}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
