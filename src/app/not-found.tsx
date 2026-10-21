import { ErrorView } from "@/app/components/ErrorView";
import { NotFoundReporter } from "@/app/components/NotFoundReporter";
import { translate } from "@/utils/translate";

// 라우트 자체가 없는 진짜 404 — 서버 도메인 에러(ErrorPage)와 같은 디자인, 제목만 '페이지가 존재하지 않아요'.
export default async function NotFound() {
  const [title, message, homeLabel] = await Promise.all([
    translate('error_page_not_found_title'),
    translate('error_page_not_found_message'),
    translate('error_page_go_home'),
  ]);
  return (
    <>
      <NotFoundReporter/>
      <ErrorView title={title} message={message} homeLabel={homeLabel}/>
    </>
  );
}
