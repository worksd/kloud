import { redirect } from "next/navigation";

// 번들 결제 진입점 — 통합 결제 페이지(/payment)로 redirect.
// lesson/lesson-group과 동일한 패턴.
export default async function BundlePaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os?: string, appVersion?: string, targetUserId?: string }>
}) {
  const { id } = await params;
  const searchParamsObj = await searchParams;

  const queryParams = new URLSearchParams({
    type: 'bundle',
    id: id.toString(),
    ...(searchParamsObj.appVersion && { appVersion: searchParamsObj.appVersion }),
    ...(searchParamsObj.os && { os: searchParamsObj.os }),
    ...(searchParamsObj.targetUserId && { targetUserId: searchParamsObj.targetUserId }),
  });

  redirect(`/payment?${queryParams.toString()}`);
}
