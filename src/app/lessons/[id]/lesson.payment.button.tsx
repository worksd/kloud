"use client";

import { CommonSubmitButton } from "@/app/components/buttons";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { TicketResponse } from "@/app/endpoint/ticket.endpoint";

type LessonPaymentButtonProps = {
    id: number;
    ticketData?: TicketResponse;
};

const LessonPaymentButton = ({ id, ticketData }: LessonPaymentButtonProps) => {
    const router = useRouter();
    const buttonText = useMemo(() => (ticketData != null ? "내 수강권 보러가기" : "수강권 결제하기"), [ticketData]);

    const handleOnClick = useCallback(() => {
        const isPaid = ticketData != null;
        const screen = isPaid ? KloudScreen.TicketDetail(ticketData.id) : KloudScreen.LessonPayment(id);

        if (window.KloudEvent) {
            window.KloudEvent.push(screen);
        } else {
            router.push(screen);
        }
    }, [id, router, ticketData]);

    return <CommonSubmitButton originProps={{ onClick: handleOnClick }}>{buttonText}</CommonSubmitButton>;
};

export default LessonPaymentButton;
