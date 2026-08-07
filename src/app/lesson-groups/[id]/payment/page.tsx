import { redirect } from "next/navigation";

// 수업 가격 정책(정기) 결제 진입점 — 통합 결제 페이지(/payment)로 redirect.
// 수업 상세의 결제 버튼이 `/lesson-groups/{pricePolicyId}/payment?type=lesson-group&id={pricePolicyId}`로 내려와
// 여기로 들어온다. id는 lesson id가 아니라 가격 정책 id다. bundle/lesson과 동일한 패턴.
export default async function LessonGroupPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os?: string, appVersion?: string, targetUserId?: string }>
}) {
  const { id } = await params;
  const searchParamsObj = await searchParams;

  const queryParams = new URLSearchParams({
    type: 'lesson-group',
    id: id.toString(),
    ...(searchParamsObj.appVersion && { appVersion: searchParamsObj.appVersion }),
    ...(searchParamsObj.os && { os: searchParamsObj.os }),
    ...(searchParamsObj.targetUserId && { targetUserId: searchParamsObj.targetUserId }),
  });

  redirect(`/payment?${queryParams.toString()}`);
}
