import { BillingCardForm } from "@/app/profile/setting/account/paymentMethod/BillingCardForm";
import { getBillingListAction } from "@/app/profile/setting/account/paymentMethod/get.billing.list.action";
import { getMeBirthAction } from "@/app/profile/setting/account/paymentMethod/get.me.birth.action";
import { getLocale, translate } from "@/utils/translate";
import { SettingPcShell } from "@/app/profile/setting/SettingPcShell";

export default async function PaymentMethodPage({searchParams}: {
  searchParams: Promise<{ appVersion?: string }>
}) {
  const { appVersion } = await searchParams;
  const [res, birth] = await Promise.all([getBillingListAction(), getMeBirthAction()])
  if (!('billings' in res)) return null;

  const locale = await getLocale();

  return (
    <SettingPcShell
      isWeb={appVersion === '' || appVersion == null}
      title={await translate('payment_method_management')}
      mobile={
        <div className={'pt-0'}>
          <BillingCardForm cards={res.billings} locale={locale} birth={birth}/>
        </div>
      }
    >
      <BillingCardForm cards={res.billings} locale={locale} birth={birth} pcCard/>
    </SettingPcShell>
  );
}
