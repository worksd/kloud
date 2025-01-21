"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import { useCallback, useEffect, useState } from "react";
import { getBottomMenuList } from "@/utils";
import { KloudScreen } from "@/shared/kloud.screen";
import { errorConverter } from "@/utils/error.converter";

export default function PaymentButton({ lessonId, price, title }: { lessonId: number, price: number ,title: string }) {
    const handlePayment = useCallback(async () => {
        const paymentInfo: PaymentInfo = {
            storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
            channelKey: process.env.NODE_ENV === "development"
              ? process.env.NEXT_PUBLIC_TEST_PORTONE_CHANNEL_KEY!
              : process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
            paymentId: generatePaymentId(lessonId),
            orderName: title,
            price: price,
        }
        window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
    }, [lessonId]);

    useEffect(() => {
        window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
            const bottomMenuList = getBottomMenuList();
            const bootInfo = JSON.stringify({
                bottomMenuList: bottomMenuList,
                route: KloudScreen.Main,
                pushRoute: KloudScreen.TicketDetail(Number.parseInt(data.paymentId))
            });
            console.log('bootInfo = ' + bootInfo);
            window.KloudEvent?.navigateMain(bootInfo);
            window.KloudEvent?.showToast(`${data.paymentId} 결제에 성공했습니다.`)
        }
    }, [])

    useEffect(() => {
        window.onErrorInvoked = async ( data: {code: string}) => {
            const info = {
                id: 'Empty',
                title: errorConverter({code: data.code}).title,
                type: 'SIMPLE',
                message: errorConverter({code: data.code}).message,
            }
            window.KloudEvent?.showDialog(JSON.stringify(info));
        }
    }, [])

    return (
        <CommonSubmitButton originProps={{ onClick: handlePayment }}>
            <p className="flex-grow-0 flex-shrink-0 text-base font-medium text-center text-white">
                {new Intl.NumberFormat("ko-KR").format(price)}원 결제하기
            </p>
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
export const generatePaymentId = (lessonId: number): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // 10자리 랜덤 문자열 생성 (알파벳 대문자 + 숫자)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomStr = Array.from(
      { length: 10 },
      () => characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');

    // 학원번호-날짜-랜덤문자열
    return `${lessonId}-${dateStr}-${randomStr}`;
}