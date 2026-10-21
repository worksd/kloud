import React from 'react';
import { GuinnessErrorCase } from '@/app/guinnessErrorCase';
import { ErrorView } from '@/app/components/ErrorView';
import { translate } from '@/utils/translate';

// 서버 페이지용 공통 에러 화면 — `if (isGuinnessErrorCase(res)) return <ErrorPage error={res}/>`.
// 서버가 내려준 message가 곧 사용자 안내라 제목으로 올린다(예: '수업이 존재하지 않습니다', '이미 신청한 묶음이에요').
// 메시지가 비어 있으면 '문제가 생겼어요'. title/message를 넘기면 그 값이 우선한다.
// 라우트 자체가 없는 진짜 404는 여기가 아니라 app/not-found.tsx('페이지가 존재하지 않아요').
export async function ErrorPage({ error, title, message }: {
  error: GuinnessErrorCase;
  title?: string;
  message?: string;
}) {
  const [fallbackTitle, homeLabel] = await Promise.all([
    translate('error_page_title'),
    translate('error_page_go_home'),
  ]);
  const serverMessage = error.message?.trim() || '';
  return <ErrorView title={title ?? (serverMessage || fallbackTitle)} message={message} homeLabel={homeLabel}/>;
}
