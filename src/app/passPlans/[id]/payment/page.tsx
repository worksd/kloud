import { redirect } from "next/navigation";

export default async function PassPayment({
  params,
  searchParams
}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ os?: string, appVersion?: string }>
}) {
  const { id } = await params;
  const searchParamsObj = await searchParams;

  const queryParams = new URLSearchParams({
    type: 'pass-plan',
    id: id.toString(),
    ...(searchParamsObj.appVersion && { appVersion: searchParamsObj.appVersion }),
    ...(searchParamsObj.os && { os: searchParamsObj.os }),
  });

  redirect(`/payment?${queryParams.toString()}`);
}