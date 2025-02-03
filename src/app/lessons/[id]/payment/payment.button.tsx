"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import { useCallback, useEffect } from "react";
import { getBottomMenuList } from "@/utils";
import { KloudScreen } from "@/shared/kloud.screen";
import { errorConverter } from "@/utils/error.converter";
import { createTicketAction } from "@/app/lessons/[id]/payment/create.ticket.action";

export default function PaymentButton({lessonId, price, title, userId, os, method}: {
  lessonId: number,
  userId?: string,
  price: number,
  title: string,
  os: string,
  method: string
}) {
  const handlePayment = useCallback(async () => {
    if (method === '신용카드') {
      const paymentInfo = os == 'Android' ? {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
        channelKey: process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_TEST_PORTONE_CHANNEL_KEY!
          : process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: generatePaymentId(lessonId),
        orderName: title,
        price: price,
        userId: userId,
      } : {
        paymentId: generatePaymentId(lessonId),
        pg: 'tosspayments',
        scheme: 'iamport',
        orderName: title,
        amount: `${price}`,
        method: 'card',
        userId: userId,
        userCode: process.env.NEXT_PUBLIC_USER_CODE,
      }
      window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
    } else if (method === '계좌이체') {
      // TODO: 문구 수정
      const dialogInfo = {
        id: `Payment`,
        type: 'YESORNO',
        title: '계좌이체',
        message: `${title} 수업의 수강권을 계좌이체로 구매하시겠습니까?\n\n수강권 : ${new Intl.NumberFormat("ko-KR").format(price)}원`,
      }
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }
  }, [lessonId, method]);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      const res = await createTicketAction({paymentId: data.paymentId, lessonId: lessonId, status: 'Paid'});
      console.log(res)
      const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0) : null // TODO: API 못쐈을때 이벤트 처리
      console.log(pushRoute)
      const bottomMenuList = getBottomMenuList();
      const bootInfo = JSON.stringify({
        bottomMenuList: bottomMenuList,
        route: pushRoute,
      });
      window.KloudEvent?.navigateMain(bootInfo);
      window.KloudEvent?.showToast(`${title} 결제에 성공했습니다.`)
    }
  }, [])

  useEffect(() => {
    window.onErrorInvoked = async (data: { code: string }) => {
      const info = {
        id: 'Empty',
        title: errorConverter({code: data.code}).title,
        type: 'SIMPLE',
        message: errorConverter({code: data.code}).message,
      }
      window.KloudEvent?.showDialog(JSON.stringify(info));
    }
  }, [])

  useEffect(() => {
    window.onDialogConfirm = async (data: { id: string, route: string}) => {
      const paymentId = generatePaymentId(lessonId);
      const res = await createTicketAction({paymentId: paymentId, lessonId: lessonId, status: 'Pending'});
      const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0) : null
      const bottomMenuList = getBottomMenuList();
      const bootInfo = JSON.stringify({
        bottomMenuList: bottomMenuList,
        route: pushRoute,
      });
      window.KloudEvent?.navigateMain(bootInfo);
    }
  }, [])
  return (
    <CommonSubmitButton originProps={{onClick: handlePayment}}>
      <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-white">
        {new Intl.NumberFormat("ko-KR").format(price)}원 결제하기
      </p>
    </CommonSubmitButton>
  );
}

type AndroidPaymentInfo = {
  storeId: string,
  channelKey: string,
  paymentId: string,
  orderName: string,
  price: number,
  userId?: string,
}

type iOSPaymentInfo = {
  paymentId: string,
  orderName: string,
  amount: string,
  method: string,
  scheme: string,
  pg: string,
  userId?: string,
  useCode?: string,

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
    {length: 10},
    () => characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');

  // 학원번호-날짜-랜덤문자열
  return `${lessonId}-${dateStr}-${randomStr}`;
}