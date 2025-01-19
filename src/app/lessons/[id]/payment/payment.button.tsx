"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import LoadSpinner from "@/app/components/LoadSpinner";
import { useCallback, useEffect, useState } from "react";
import { getBottomMenuList } from "@/utils";
import { KloudScreen } from "@/shared/kloud.screen";

export default function PaymentButton({ data }: { data: any }) {
    const [loading, setLoading] = useState(false);

    const handlePayment = useCallback(async () => {
        const paymentInfo: PaymentInfo = {
            storeId: 'store-53f5255f-266f-43c1-b77a-c1b9549383dc',
            channelKey: 'channel-key-4112f241-b68a-413d-b9f7-c033c98f043f',
            paymentId: 'asdfafIDSLSKsdfDJasdfFL1as24asdf123132',
            orderName: '안드로이드테스트',
            price: 1000,
        }
        window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
    }, [data]);

    useEffect(() => {
        window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
            const bottomMenuList = getBottomMenuList();
            const bootInfo = JSON.stringify({
                bottomMenuList: bottomMenuList,
                route: KloudScreen.Main,
                pushRoute: KloudScreen.TicketDetail(0) // TODO: 하드코딩 삭제
            });
            window.KloudEvent?.navigateMain(bootInfo);
            window.KloudEvent?.showToast(`${data.paymentId} 결제에 성공했습니다.`)
        }
    }, [])

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

interface PaymentInfo {
    storeId: string,
    channelKey: string,
    paymentId: string,
    orderName: string,
    price: number,
}