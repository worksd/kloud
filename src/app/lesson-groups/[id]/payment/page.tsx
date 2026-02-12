import { redirect } from "next/navigation";

export default async function LessonGroupPaymentPage({
  params,
  searchParams
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
