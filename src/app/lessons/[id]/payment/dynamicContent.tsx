"use client";

import { useCallback } from "react";
import PortOne, { PaymentRequest } from "@portone/browser-sdk/v2";

export default function DynamicLessonPaymentContent({ data }: { data: any }) {
    const handlePayment = useCallback(async () => {
        const info: PaymentRequest = {
            storeId: process.env.NEXT_PUBLIC_PORTONE_SOTRE_ID!,
            channelKey:
                process.env.NODE_ENV !== "development"
                    ? process.env.NEXT_PUBLIC_TEST_PORTONE_CHANNEL_KEY!
                    : process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
            paymentId: `${data.id}-${crypto.randomUUID()}`,
            orderName: data.title,
            totalAmount: data.price,
            currency: "CURRENCY_KRW",
            payMethod: "CARD",
            redirectUrl: `${window.location.origin}/lessons/${data.id}/payment`,
            customer: {
                customerId: "data.user.id",
                fullName: "profile.name",
                email: "cc@naver.com",
            },
        };

        const response = await PortOne.requestPayment(info);
        console.log(response)
    }, [data]);

    return (
        <button className="flex justify-center items-center w-full h-14 rounded-lg bg-black" onClick={handlePayment}>
            <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-center text-white">
                {new Intl.NumberFormat("ko-KR").format(data.price)}원 결제하기
            </p>
        </button>
    );
}
