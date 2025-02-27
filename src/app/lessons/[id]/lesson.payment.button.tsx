"use client";

import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

type LessonPaymentButtonProps = {
    id: number;
    ticketData?: TicketResponse;
    disabled: boolean;
};

const LessonPaymentButton = ({ id, ticketData, disabled }: LessonPaymentButtonProps) => {
    const router = useRouter();
    const buttonText = useMemo(() => {
        if (disabled) return "종료된 수업입니다.";
        return ticketData != null ? "내 수강권 보러가기" : "수강권 결제하기";
    }, [disabled, ticketData]);
    const handleOnClick = useCallback(() => {
        const isPaid = ticketData != null;
        const screen = isPaid ? KloudScreen.TicketDetail(ticketData.id, false) : KloudScreen.LessonPayment(id);

        if (window.KloudEvent) {
            window.KloudEvent.push(screen);
        } else {
            router.push(screen);
        }
    }, [id, router, ticketData]);

    return <CommonSubmitButton originProps={{onClick: handleOnClick, disabled: disabled}}
                               disabled={disabled}>{buttonText}</CommonSubmitButton>;
};

export default LessonPaymentButton;
