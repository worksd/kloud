'use client'
// 홈 — 미납 결제건 다이얼로그. GET /home unpaidPaymentRecords(정규반, 로그인 시)가 있으면 홈 진입 때마다 띄운다(모바일·PC 공통).
// 어떤 수업인지 사진(정규반 이미지)과 어느 스튜디오인지 로고·이름까지 보여줘야 해서 네이티브 YESORNO 가 아니라
// 웹뷰 안에서 CommonDialog 로 직접 그린다(앱·웹 동일). 결제하기 → 서버가 준 route 로 kloudNav.push(FE 가 item/id 를 조립하지 않는다).
// 미납이어도 수업은 그대로 들을 수 있어 기한·경고 없이 제목·금액만. 닫기는 우측 상단 X(취소 버튼 없음). 여러 건이면 첫 건으로 띄우고 나머지 건수를 덧붙인다.
// 결제하기는 다이얼로그를 닫으면서 이동 — 결제 페이지에서 돌아왔을 때 홈에 다이얼로그가 남아 있지 않게.

import React, { useEffect, useState } from "react";
import { HomeUnpaidPaymentRecordResponse } from "@/app/endpoint/home.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { kloudNav } from "@/app/lib/kloudNav";
import { CommonDialog } from "@/app/components/CommonDialog";
import { CircleImage } from "@/app/components/CircleImage";

export const HomeUnpaidDialog = ({ records, locale }: { records: HomeUnpaidPaymentRecordResponse[]; locale: Locale }) => {
  const list = records.filter((r) => !!r.route);
  const first = list[0];
  const [open, setOpen] = useState(false);
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({ locale, key });

  useEffect(() => {
    if (!first) return;
    // 홈이 그려진 직후 살짝 늦게 — 진입 전환 애니메이션과 겹치지 않게
    const timer = setTimeout(() => setOpen(true), 300);
    return () => clearTimeout(timer);
  }, [first?.id]);

  if (!first) return null;
  const image = first.productImageUrl || first.studio?.profileImageUrl || null;
  const studio = first.studio;
  // 상품명이 안 오면 스튜디오 이름으로 — 응답 필드가 확정되기 전 폴백
  const productName = first.productName || studio?.name || '';
  const amount = typeof first.amount === 'number' ? first.amount : null;

  return (
    <CommonDialog open={open} onClose={() => setOpen(false)}>
      <div className="relative overflow-hidden rounded-2xl">
        {/* 우측 상단 닫기 — 사진 위에 올라가도 보이게 흰 원형 배경 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white active:bg-[#F2F4F6] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 3L15 15M15 3L3 15" stroke="#505356" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
        {/* 수업 사진 — 위에 어두운 그라데이션, 왼쪽 아래 스튜디오 로고·이름 */}
        {image && (
          <div className="relative aspect-[16/10] bg-[#F2F4F6]">
            <img src={image} alt={productName} className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20"/>
            {studio && (
              <div className="absolute left-4 bottom-3.5 flex items-center gap-2 text-white">
                <CircleImage size={22} imageUrl={studio.profileImageUrl} className=" ring-2 ring-white/80"/>
                <span className="text-[13px] font-semibold drop-shadow tracking-[-0.2px]">{studio.name}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-5">
          {/* 사진이 없을 때만 — 스튜디오 로고·이름을 본문 맨 위에 */}
          {!image && studio && (
            <div className="mb-3 flex items-center gap-2 text-[#4E5968]">
              <CircleImage size={22} imageUrl={studio.profileImageUrl}/>
              <span className="text-[13px] font-semibold tracking-[-0.2px]">{studio.name}</span>
            </div>
          )}
          {/* 제목 — '{unpaid}' 자리의 '미납' 만 빨간색 */}
          <h2 className="text-[20px] font-bold text-[#191F28] tracking-[-0.3px]">
            {t('home_unpaid_title').split('{unpaid}').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[#FF6B6B]">{t('home_unpaid_title_highlight')}</span>}
                {part}
              </React.Fragment>
            ))}
          </h2>

          {/* 어떤 수업·얼마 — 이름/설명 왼쪽, 금액 오른쪽 */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FA] px-4 py-3.5">
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-[15px] font-bold text-[#191F28] truncate tracking-[-0.3px]">{productName}</span>
              {first.productDescription && (
                <span className="text-[12.5px] text-[#8B95A1] truncate tracking-[-0.2px]">{first.productDescription}</span>
              )}
              {list.length > 1 && (
                <span className="text-[12.5px] text-[#8B95A1] tracking-[-0.2px]">{t('home_unpaid_more').replace('{n}', String(list.length - 1))}</span>
              )}
            </div>
            {amount != null && (
              <span className="shrink-0 text-[20px] font-bold font-paperlogy text-[#191F28] leading-none">
                {amount.toLocaleString('ko-KR')}<span className="text-[14px] ml-0.5">{t('won')}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => { setOpen(false); kloudNav.push(first.route); }}
            className="mt-5 w-full h-14 rounded-[16px] bg-[#191F28] text-white text-[17px] font-bold hover:opacity-90 active:opacity-80 transition-opacity"
          >
            {t('regular_class_unpaid_pay')}
          </button>
        </div>
      </div>
    </CommonDialog>
  );
};
