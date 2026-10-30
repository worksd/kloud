import { BillingCardForm } from "@/app/profile/setting/account/paymentMethod/BillingCardForm";
import { getBillingListAction } from "@/app/profile/setting/account/paymentMethod/get.billing.list.action";
import { getMeBirthAction } from "@/app/profile/setting/account/paymentMethod/get.me.birth.action";
import { getLocale, translate } from "@/utils/translate";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function PaymentMethodPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string, add?: string }>
}) {
  // ?add=1 — 마이페이지 '결제 카드' 섹션의 추가 버튼에서 들어오면 페이지가 뜨자마자 추가 바텀시트를 연다
  const { appVersion, add } = await searchParams;
  const autoOpenAdd = add === '1';
  const [res, birth] = await Promise.all([getBillingListAction(), getMeBirthAction()])
  if (!('billings' in res)) return null;

  const locale = await getLocale();

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('payment_method_management')}
      mobile={
        <div className={'pt-0'}>
          <BillingCardForm cards={res.billings} locale={locale} birth={birth} autoOpenAdd={autoOpenAdd}/>
        </div>
      }
    >
      <BillingCardForm cards={res.billings} locale={locale} birth={birth} pcCard autoOpenAdd={autoOpenAdd}/>
    </SettingPcShell>
  );
}
