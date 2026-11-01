// 신용/체크카드 등록 — /profile/setting/account/paymentMethod/add. 바텀시트 대신 별도 페이지(키보드가 올라와도 화면이 자연스럽게 스크롤).
// 결제수단 관리의 + 버튼, 마이페이지 '결제 카드 등록' 카드에서 들어온다. 앱은 네이티브 앱바(제목 '신용/체크카드 등록'), 웹은 폼이 X + 제목을 직접 그린다.

import React from "react";
import { api } from "@/app/api.client";
import { getLocale } from "@/utils/translate";
import { PaymentCardRegisterForm } from "@/app/profile/setting/account/paymentMethod/add/PaymentCardRegisterForm";

export default async function PaymentCardRegisterPage({ searchParams }: {
  searchParams: Promise<{ appVersion?: string, return?: string }>
}) {
  // ?return=back — 결제 화면에서 들어온 경우. 등록 후 그 화면으로 돌아간다(웹도 history.back, 결제 화면이 목록을 다시 불러온다)
  const { appVersion, return: ret } = await searchParams;
  const [me, locale] = await Promise.all([api.user.me({}), getLocale()]);
  const user = 'id' in me ? me : null;
  return (
    <PaymentCardRegisterForm
      locale={locale}
      isWeb={appVersion === '' || appVersion == null}
      ownerName={user?.name ?? user?.nickName ?? ''}
      initialBirth={user?.birth ?? null}
      returnBack={ret === 'back'}
    />
  );
}
