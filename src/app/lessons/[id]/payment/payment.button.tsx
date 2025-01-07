"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import LoadSpinner from "@/app/components/LoadSpinner";
import PortOne, { PaymentRequest } from "@portone/browser-sdk/v2";
import { useCallback, useState } from "react";

export default function PaymentButton({ data }: { data: any }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = useCallback(async () => {
        setLoading(true);

        const info: PaymentRequest = {
            storeId: process.env.PORTONE_SOTRE_ID!,
            channelKey:
                process.env.NODE_ENV !== "development"
                    ? process.env.TEST_PORTONE_CHANNEL_KEY!
                    : process.env.PORTONE_CHANNEL_KEY!,
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
        console.log(response);
        setLoading(false);
    }, [data]);

    return (
        <CommonSubmitButton originProps={{ onClick: handlePayment }}>
            {loading ? (
                <LoadSpinner />
            ) : (
                <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-center text-white">
                    {new Intl.NumberFormat("ko-KR").format(data.price)}원 결제하기
                </p>
            )}
        </CommonSubmitButton>
    );
}
