"use client";

import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { useCallback, useMemo } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { useLocale } from "@/hooks/useLocale";

type LessonPaymentButtonProps = {
    id: number;
    ticketData?: TicketResponse;
    disabled: boolean;
};

const LessonPaymentButton = ({ id, ticketData, disabled }: LessonPaymentButtonProps) => {
    const { t, locale } = useLocale();
    const buttonText = useMemo(() => {
        if (disabled) return t("finish_lesson_title");
        return ticketData != null ? t("my_ticket") : t("purchase_ticket");
    }, [disabled, ticketData]);
    const handleOnClick = useCallback(() => {
        const isPaid = ticketData != null;
        const screen = isPaid ? KloudScreen.TicketDetail(ticketData.id, false) : KloudScreen.LessonPayment(id);
        window.KloudEvent?.push(screen);
    }, [id, ticketData]);

    return <CommonSubmitButton originProps={{onClick: handleOnClick, disabled: disabled}}
                               disabled={disabled}>{buttonText}</CommonSubmitButton>;
};

export default LessonPaymentButton;
