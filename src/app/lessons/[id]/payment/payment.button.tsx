"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import { useCallback, useEffect } from "react";
import { getBottomMenuList } from "@/utils";
import { KloudScreen } from "@/shared/kloud.screen";
import { errorConverter } from "@/utils/error.converter";
import { createTicketAction } from "@/app/lessons/[id]/payment/create.ticket.action";
import { getUserAction } from "@/app/onboarding/get.user.action";

export default function PaymentButton({lessonId, price, title, userId, os, appVersion, method, depositor}: {
  lessonId: number,
  userId?: string,
  price: number,
  title: string,
  os: string,
  appVersion: string,
  method: string,
  depositor: string,
}) {
  const handlePayment = useCallback(async () => {

    const user = await getUserAction()
    if (!user) return;

    if (!user.phone) {
      if (isLowerVersion(appVersion, '1.0.2')) {
        window.KloudEvent?.push(KloudScreen.Certification)
      } else {
        window.KloudEvent?.fullSheet(KloudScreen.Certification)
      }
      return;
    }

    if (method === '신용카드') {
      const paymentInfo = os == 'Android' ? {
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: generatePaymentId(lessonId),
        orderName: title,
        price: price,
        userId: userId,
      } : {
        paymentId: generatePaymentId(lessonId),
        pg: process.env.NEXT_PUBLIC_IOS_PORTONE_PG,
        scheme: 'iamport',
        orderName: title,
        amount: `${price}`,
        method: 'card',
        userId: userId,
        userCode: process.env.NEXT_PUBLIC_USER_CODE,
      }
      window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
    } else if (method === '계좌이체') {
      if (depositor.length === 0) {
        const info = {
          id: 'Empty',
          title: '계좌이체 안내',
          type: 'SIMPLE',
          message: '입금자명을 입력해주시길 바랍니다',
        }
        window.KloudEvent?.showDialog(JSON.stringify(info));
      } else {
        const dialogInfo = {
          id: `Payment`,
          type: 'YESORNO',
          title: '계좌이체',
          message: `${title} 수업의 수강권을 계좌이체로 구매하시겠습니까?\n\n수강권 : ${new Intl.NumberFormat("ko-KR").format(price)}원\n\n입금자명: ${depositor} \n\n(실제 입금자명과 다를 경우 확인이 어려울 수 있습니다)`,
        }
        window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
      }
    }
  }, [lessonId, method, depositor]);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      const res = await createTicketAction({paymentId: data.paymentId, lessonId: lessonId, status: 'Paid'});
      console.log(res)
      const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0, true) : null // TODO: API 못쐈을때 이벤트 처리
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
      const res = await createTicketAction({
        paymentId: paymentId,
        lessonId: lessonId,
        status: 'Pending',
        depositor: depositor,
      });
      const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0, true) : null
      const bottomMenuList = getBottomMenuList();
      const bootInfo = JSON.stringify({
        bottomMenuList: bottomMenuList,
        route: pushRoute,
      });
      window.KloudEvent?.navigateMain(bootInfo);
    }
  }, [depositor])
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

function isLowerVersion(currentVersion: string, targetVersion: string): boolean {
  const current = currentVersion.split('.').map(Number);
  const target = targetVersion.split('.').map(Number);

  for (let i = 0; i < target.length; i++) {
    if ((current[i] ?? 0) < target[i]) return true;
    if ((current[i] ?? 0) > target[i]) return false;
  }
  return false;
}