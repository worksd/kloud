"use server";

import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { translate } from "@/utils/translate";
import { GetLessonResponse, LessonStatus } from "@/app/endpoint/lesson.endpoint";

export const LessonPaymentButton = async ({lesson}: { lesson: GetLessonResponse }) => {

  const clickable = lesson.status === LessonStatus.Recruiting ||
    (lesson.status !== LessonStatus.Completed && lesson.ticket?.id != null)
  const targetRoute =
    lesson.ticket?.id != null
      ? KloudScreen.TicketDetail(lesson.ticket.id, false)
      : KloudScreen.LessonPayment(lesson.id);

  let title: string;

  if (lesson.status === LessonStatus.Completed) {
    title = await translate("finish_lesson_title");
  } else if (lesson.ticket?.id != null) {
    title = await translate("my_ticket");
  } else {
    title = await getButtonTitleResourceByStatus({ lesson });
  }

  return (
    <NavigateClickWrapper
      method="push"
      route={targetRoute}
    >
      <CommonSubmitButton
        disabled={!clickable}
      >
        {title}
      </CommonSubmitButton>
    </NavigateClickWrapper>
  );
};

const getButtonTitleResourceByStatus = async ({lesson}: { lesson: GetLessonResponse }): Promise<string> => {
  if (lesson.status == LessonStatus.NotForSale) return await translate('open_date') + ' : ' + lesson.saleDate
  else if (lesson.status == LessonStatus.Cancelled) return await translate('canceled_lesson')
  else if (lesson.status == LessonStatus.Recruiting) return await translate('purchase_ticket')
  else if (lesson.status == LessonStatus.Completed) return await translate('finish_lesson_title')
  else if (lesson.status == LessonStatus.Ready) return await translate('register_lesson_finish')
  else if (lesson.status == LessonStatus.Pending) return await translate('purchase_ticket')
  else return ''
}