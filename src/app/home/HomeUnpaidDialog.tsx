'use client'
// 홈 — 미납 결제건 다이얼로그. GET /home unpaidPaymentRecords(정규반, 로그인 시)가 있으면 홈 진입 때마다 띄운다(모바일·PC 공통).
// 어떤 수업인지 사진(정규반 이미지)과 어느 스튜디오인지 로고·이름까지 보여줘야 해서 네이티브 YESORNO 가 아니라
// 웹뷰 안에서 CommonDialog 로 직접 그린다(앱·웹 동일). 결제하기 → 서버가 준 route 로 kloudNav.push(FE 가 item/id 를 조립하지 않는다).
// 미납이어도 수업은 그대로 들을 수 있어 기한·경고 없이 '미납됐으니 결제해 달라'고만. 여러 건이면 첫 건으로 띄우고 나머지 건수를 덧붙인다.
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

  return (
    <CommonDialog open={open} onClose={() => setOpen(false)}>
      <div className="overflow-hidden rounded-2xl">
        {/* 수업 사진 — 위에 어두운 그라데이션, 왼쪽 위 '미납' 칩, 왼쪽 아래 스튜디오 로고·이름 */}
        {image && (
          <div className="relative aspect-[16/10] bg-[#F2F4F6]">
            <img src={image} alt={first.productName} className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20"/>
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 text-[12px] font-bold text-[#FF6B6B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]"/>
              {t('pass_status_unpaid')}
            </span>
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
          <h2 className="text-[20px] font-bold text-[#191F28] tracking-[-0.3px]">{t('home_unpaid_title')}</h2>

          {/* 어떤 수업·얼마 — 이름/설명 왼쪽, 금액 오른쪽 */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FA] px-4 py-3.5">
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-[15px] font-bold text-[#191F28] truncate tracking-[-0.3px]">{first.productName}</span>
              {first.productDescription && (
                <span className="text-[12.5px] text-[#8B95A1] truncate tracking-[-0.2px]">{first.productDescription}</span>
              )}
              {list.length > 1 && (
                <span className="text-[12.5px] text-[#8B95A1] tracking-[-0.2px]">{t('home_unpaid_more').replace('{n}', String(list.length - 1))}</span>
              )}
            </div>
            <span className="shrink-0 text-[20px] font-bold font-paperlogy text-[#191F28] leading-none">
              {first.amount.toLocaleString('ko-KR')}<span className="text-[14px] ml-0.5">{t('won')}</span>
            </span>
          </div>

          <p className="mt-3 text-[13.5px] text-[#4E5968] tracking-[-0.2px]">{t('regular_class_unpaid_notice')}</p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 h-12 rounded-[14px] bg-[#F2F4F6] text-[#4E5968] text-[15px] font-bold hover:bg-[#E5E8EB] active:bg-[#E5E8EB] transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); kloudNav.push(first.route); }}
              className="flex-[1.4] h-12 rounded-[14px] bg-[#191F28] text-white text-[15px] font-bold hover:opacity-90 active:opacity-80 transition-opacity"
            >
              {t('regular_class_unpaid_pay')}
            </button>
          </div>
        </div>
      </div>
    </CommonDialog>
  );
};
