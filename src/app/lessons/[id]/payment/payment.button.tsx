"use client";

import CommonSubmitButton from "@/app/components/buttons/CommonSubmitButton";
import { useCallback, useEffect, useState } from "react";
import { KloudScreen } from "@/shared/kloud.screen";
import { createTicketAction } from "@/app/lessons/[id]/payment/create.ticket.action";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { useLocale } from "@/hooks/useLocale";
import { PaymentMethod } from "@/app/passPlans/[id]/payment/PassPaymentInfo";
import { PaymentRequest, requestPayment } from "@portone/browser-sdk/v2";
import { createAccountTransferMessage, createDialog, DialogId } from "@/utils/dialog.factory";
import { createPassAction } from "@/app/passPlans/[id]/payment/create.pass.action";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { DialogInfo } from "@/app/setting/setting.menu.item";


export const PaymentTypes = [
  {value: 'lesson', prefix: 'LT'},
  {value: 'passPlan', prefix: 'LP'},
] as const;

export type PaymentType = (typeof PaymentTypes)[number];

type PaymentInfo = {
  storeId?: string
  pg?: string
  channelKey?: string
  scheme?: string
  paymentId: string
  type: PaymentType,
  orderName: string
  method: PaymentMethod
  userId: string
  price?: number
  amount?: string
  userCode?: string
}

export default function PaymentButton({
                                        appVersion,
                                        lessonId,
                                        passPlanId,
                                        selectedPass,
                                        type,
                                        price,
                                        title,
                                        userId,
                                        os,
                                        method,
                                        depositor,
                                        disabled
                                      }: {
  appVersion: string;
  lessonId?: number,
  selectedPass?: GetPassResponse,
  passPlanId?: number,
  userId: number,
  type: PaymentType,
  price: number,
  title: string,
  os: string,
  method: PaymentMethod,
  depositor: string,
  disabled: boolean,
}) {
  const handlePayment = useCallback(async () => {

    const user = await getUserAction()
    if (!user) return;

    if (!user.phone) {
      window.KloudEvent?.fullSheet(KloudScreen.Certification)
      return;
    }

    const paymentId = generatePaymentId({type: type, id: lessonId ?? passPlanId ?? -1})

    if (method === 'credit') {
      if (appVersion == '') {
        const mobileWebPaymentRequest: PaymentRequest = {
          storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
          channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
          paymentId: paymentId,
          orderName: title,
          payMethod: 'CARD',
          totalAmount: price,
          currency: "CURRENCY_KRW",
          redirectUrl: process.env.NEXT_PUBLIC_PORTONE_REDIRECT_URL ?? '',
        }
        await requestPayment(mobileWebPaymentRequest)
      } else {
        const paymentInfo: PaymentInfo = os == 'Android' ? {
          storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
          channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? '',
          paymentId: paymentId,
          orderName: title,
          method: 'credit',
          type: type,
          price: price,
          userId: `${userId}`,
        } : {
          paymentId: paymentId,
          pg: process.env.NEXT_PUBLIC_IOS_PORTONE_PG,
          scheme: 'iamport',
          orderName: title,
          type: type,
          amount: `${price}`,
          method: 'credit',
          userId: `${userId}`,
          userCode: process.env.NEXT_PUBLIC_USER_CODE,
        }
        window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
      }
    } else if (method === 'account_transfer') {
      if (depositor.length === 0) {
        const dialog = await createDialog('EmptyDepositor')
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      } else {
        const dialog = await createAccountTransferMessage({
          title,
          price,
          depositor,
        })
        window.KloudEvent?.showDialog(JSON.stringify(dialog));
      }
    } else if (method === 'pass') {
      const dialogInfo = await createDialog('UsePass', `\n구매상품 : ${title}\n패스권 : ${selectedPass?.passPlan?.name}\n\n 위의 수강권을 구매하시겠습니까?`)
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }
  }, [lessonId, method, depositor]);

  const {t} = useLocale()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      if (type.value == 'lesson') {
        const res = await createTicketAction({paymentId: data.paymentId, lessonId: lessonId ?? -1, status: 'Paid'});
        const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0, true) : null
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: pushRoute,
        });
        window.KloudEvent?.navigateMain(bootInfo);
      } else if (type.value == 'passPlan') {
        const res = await createPassAction({paymentId: data.paymentId, passPlanId: passPlanId ?? -1, status: 'Active'});
        const pushRoute = 'id' in res ? KloudScreen.PassPaymentComplete(res.id ?? 0) : null
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: pushRoute,
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    }
  }, [selectedPass])

  useEffect(() => {
    window.onErrorInvoked = async (data: { code: string }) => {
      const dialog = await createDialog('PaymentFail')
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    }
  }, [])

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      const paymentId = generatePaymentId({type: type, id: lessonId ?? passPlanId ?? -1});
      if (data.id == 'AccountTransfer') {
        if (type.value == 'lesson') {

          const res = await createTicketAction({
            paymentId: paymentId,
            lessonId: lessonId ?? -1,
            status: 'Pending',
            depositor: depositor,
          });
          const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0, true) : null
          const bottomMenuList = await getBottomMenuList();
          const bootInfo = JSON.stringify({
            bottomMenuList: bottomMenuList,
            route: pushRoute,
          });
          window.KloudEvent?.navigateMain(bootInfo);
        } else if (type.value == 'passPlan') {
          const res = await createPassAction({
            passPlanId: passPlanId ?? 0,
            paymentId: paymentId,
            status: 'Pending',
            depositor: depositor,
          })
          if ('id' in res) {
            const pushRoute = KloudScreen.MyPassDetail(res.id)
            const bottomMenuList = await getBottomMenuList();
            const bootInfo = JSON.stringify({
              bottomMenuList: bottomMenuList,
              route: pushRoute,
            });
            window.KloudEvent?.navigateMain(bootInfo);
          } else {
            const dialog = await createDialog('PaymentFail')
            window.KloudEvent?.showDialog(JSON.stringify(dialog));
          }
        }
      } else if (data.id == 'UsePass') {
        const res = await createTicketAction({
          paymentId: paymentId,
          lessonId: lessonId ?? 0,
          passId: selectedPass?.id ?? 0,
          status: 'Paid',
        });
        const pushRoute = 'id' in res ? KloudScreen.TicketDetail(res.id ?? 0, true) : null
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: pushRoute,
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    }
  }, [depositor])
  return (
    <CommonSubmitButton originProps={{onClick: handlePayment}} disabled={disabled}>
      <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-white">
        {mounted ? (method == 'pass' ? t('use_pass') : `${new Intl.NumberFormat("ko-KR").format(price)}${t('won')} ${t('payment')}`) : ''}
      </p>
    </CommonSubmitButton>
  );
}

const generatePaymentId = ({type, id}: { type: PaymentType, id: number }): string => {
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
  return `${type.prefix}-${id}-${dateStr}-${randomStr}`;
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