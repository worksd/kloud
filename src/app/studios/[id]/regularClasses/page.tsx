import { notFound, redirect } from "next/navigation";
import { KloudScreen } from "@/shared/kloud.screen";

// 옛 '정규반 전체보기' 경로 — 정규반·패스권 탭 페이지(/studios/:id/programs?tab=regularClass)로 합쳐졌다.
// 앱 구버전/외부 링크가 남아 있을 수 있어 리다이렉트만 남긴다.
export default async function StudioRegularClasses({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const id = Number((await params).id);
  if (isNaN(id) || !id) notFound();
  // appVersion 등 웹뷰 식별 쿼리는 그대로 넘긴다
  const qs = new URLSearchParams();
  Object.entries(await searchParams).forEach(([k, v]) => { if (v != null && k !== 'tab') qs.set(k, v); });
  const extra = qs.toString();
  redirect(`${KloudScreen.StudioPrograms(id, 'regularClass')}${extra ? `&${extra}` : ''}`);
}
