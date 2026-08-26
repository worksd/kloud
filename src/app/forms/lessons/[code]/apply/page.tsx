// 구성원 신청 폼 — form.rawgraphy.com/lessons/{code}/apply.
// 인트로에서 "신청하기"를 누르면 여기로 온다. 폼을 열 수 없는 상태(마감·정원·취소 등)는
// 인트로와 같은 판정으로 같은 안내를 띄운다 — 링크를 직접 열어도 새지 않는다.

import React from 'react';
import { formBasePath } from '@/app/forms/form.path';
import { getLocale } from '@/utils/translate';
import { loadPartnership } from '../partnership.gate';
import { PartnershipApplyForm } from '../PartnershipApplyForm';

export const dynamic = 'force-dynamic';

export default async function PartnershipApplyPage({params}: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const locale = await getLocale();
  const loaded = await loadPartnership(code, locale);
  if ('blocked' in loaded) return loaded.blocked;

  const basePath = await formBasePath(`/lessons/${encodeURIComponent(code)}`);
  return <PartnershipApplyForm partnership={loaded.p} locale={locale} basePath={basePath}/>;
}
