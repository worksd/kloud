import { getLessonTicketsAction } from "@/app/lessons/[id]/action/get.lesson.tickets.action";
import { getLocale, translate } from "@/utils/translate";
import { Locale } from "@/shared/StringResource";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { LessonStudentsListClient } from "@/app/lessons/[id]/LessonStudentsListClient";
import { LessonAdminMenu } from "@/app/lessons/[id]/LessonAdminMenu";

export async function LessonAdminInfoSection({ lessonId, adminType }: { lessonId: number; adminType: 'artist' | 'partner' }) {
  const [tickets, locale] = await Promise.all([
    getLessonTicketsAction(lessonId),
    getLocale(),
  ]);

  return (
    <div className={'w-full flex flex-col'}>
      <div className={'w-full h-3 bg-[#f7f8f9]'}/>
      <StudentsBlock tickets={tickets} lessonId={lessonId} locale={locale} adminType={adminType}/>
    </div>
  );
}

async function StudentsBlock({
  tickets,
  lessonId,
  locale,
  adminType,
}: {
  tickets: TicketResponse[];
  lessonId: number;
  locale: Locale;
  adminType: 'artist' | 'partner';
}) {
  const visible = tickets.filter(
    (t) => t.status !== 'Cancelled' && t.status !== 'CancelPending',
  );

  const title = await translate('lesson_admin_students_title');
  const countText = (await translate('lesson_admin_students_count')).replace(
    '{count}',
    String(visible.length),
  );

  return (
    <section className={'bg-white px-6 py-5'}>
      <header className={'flex items-center justify-between gap-2'}>
        <div className={'flex items-baseline gap-2'}>
          <h2 className={'text-[16px] font-bold text-black'}>{title}</h2>
          <span className={'text-[#919191] text-[13px]'}>{countText}</span>
        </div>

        <LessonAdminMenu lessonId={lessonId} locale={locale}/>
      </header>

      <LessonStudentsListClient tickets={tickets} lessonId={lessonId} locale={locale} adminType={adminType}/>
    </section>
  );
}
