import { useLocale } from "@/hooks/useLocale";
import { useCallback, useEffect } from "react";
import { getUserAction } from "@/app/onboarding/action/get.user.action";
import { KloudScreen } from "@/shared/kloud.screen";
import { errorConverter } from "@/utils/error.converter";
import CommonSubmitButton from "../../../components/buttons/CommonSubmitButton";
import { generatePaymentId } from "@/app/lessons/[id]/payment/payment.button";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";

export default function PassPaymentButton({studioId, passId, price, title, userId, os, method, depositor, disabled}: {
  studioId: number,
  passId: number,
  userId?: string,
  price: number,
  title: string,
  os: string,
  method: string,
  depositor: string,
  disabled: boolean,
}) {
  const {t, locale} = useLocale();
  const handlePayment = useCallback(async () => {
    const pushRoute = KloudScreen.StudioPassPaymentComplete(studioId)
    const bottomMenuList = await getBottomMenuList();
    const bootInfo = JSON.stringify({
      bottomMenuList: bottomMenuList,
      route: pushRoute,
    });
    window.KloudEvent?.navigateMain(bootInfo);
    // const user = await getUserAction()
    // if (!user) return;
    //
    // if (!user.phone) {
    //   window.KloudEvent?.fullSheet(KloudScreen.Certification)
    //   return;
    // }
    //
    // if (method === '신용카드') {
    //   const paymentInfo = os == 'Android' ? {
    //     storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? '',
    //     channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
    //     paymentId: generatePaymentId(passId),
    //     orderName: title,
    //     price: price,
    //     userId: userId,
    //   } : {
    //     paymentId: generatePaymentId(passId),
    //     pg: process.env.NEXT_PUBLIC_IOS_PORTONE_PG,
    //     scheme: 'iamport',
    //     orderName: title,
    //     amount: `${price}`,
    //     method: 'card',
    //     userId: userId,
    //     userCode: process.env.NEXT_PUBLIC_USER_CODE,
    //   }
    //   window.KloudEvent?.requestPayment(JSON.stringify(paymentInfo));
    // } else if (method === '계좌이체') {
    //   if (depositor.length === 0) {
    //     const info = {
    //       id: 'Empty',
    //       title: '계좌이체 안내',
    //       type: 'SIMPLE',
    //       message: '입금자명을 입력해주시길 바랍니다',
    //     }
    //     window.KloudEvent?.showDialog(JSON.stringify(info));
    //   } else {
    //     const dialogInfo = {
    //       id: `Payment`,
    //       type: 'YESORNO',
    //       title: '계좌이체',
    //       message: `${title} 수업의 수강권을 계좌이체로 구매하시겠습니까?\n\n수강권 : ${new Intl.NumberFormat("ko-KR").format(price)}원\n\n입금자명: ${depositor} \n\n(실제 입금자명과 다를 경우 확인이 어려울 수 있습니다)`,
    //     }
    //     window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    //   }
    // }
  }, [method, depositor]);

  useEffect(() => {
    window.onPaymentSuccess = async (data: { paymentId: string, transactionId: string }) => {
      // TODO
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
    window.onDialogConfirm = async (data: { id: string, route: string }) => {
      // TODO
    }
  }, [depositor])
  return (
    <CommonSubmitButton originProps={{onClick: handlePayment}} disabled={disabled}>
      <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-white">
        {new Intl.NumberFormat("ko-KR").format(price)}원 결제하기
      </p>
    </CommonSubmitButton>
  );
}
