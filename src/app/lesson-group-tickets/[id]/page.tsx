import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { getLocale } from "@/utils/translate";
import { LessonGroupTicketDetailForm } from "@/app/lesson-group-tickets/[id]/LessonGroupTicketDetailForm";

export default async function LessonGroupTicketDetail({params}: {
  params: Promise<{ id: number }>,
}) {
  const {id} = await params;
  const ticket = await api.lessonGroupTicket.get({id});
  const locale = await getLocale();

  if ('id' in ticket) {
    return <LessonGroupTicketDetailForm ticket={ticket} locale={locale} />;
  } else {
    return <Loading/>;
  }
}
