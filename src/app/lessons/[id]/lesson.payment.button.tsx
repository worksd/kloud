"use server";

import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";
import { translate } from "@/utils/translate";

type LessonPaymentButtonProps = {
  id: number;
  ticketData?: TicketResponse;
  disabled: boolean;
};

export const LessonPaymentButton = async ({id, ticketData, disabled}: LessonPaymentButtonProps) => {

  const buttonTitleResource =
    disabled ? "finish_lesson_title" : ticketData != null ? "my_ticket" : "purchase_ticket";


  const targetRoute =
    ticketData != null
      ? KloudScreen.TicketDetail(ticketData.id, false)
      : KloudScreen.LessonPayment(id);

  return (
    <NavigateClickWrapper
      method="push"
      route={targetRoute}
    >
      <CommonSubmitButton
        disabled={disabled}
      >
        {await translate(buttonTitleResource)}
      </CommonSubmitButton>
    </NavigateClickWrapper>
  );
};