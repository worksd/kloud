import { PaymentMethodSheetForm } from "@/app/profile/setting/paymentMethod/sheet/PaymentMethodSheetForm";
import { translate } from "@/utils/translate";

export default async function PaymentMethodSheet({
                                                   searchParams
                                                 }: { searchParams: Promise<{ baseRoute: string }> }) {
  const {baseRoute} = await searchParams;
  return (
    <PaymentMethodSheetForm
      baseRoute={baseRoute}
      title={await translate('payment_information_input')}
      cardNumberPlaceholderText={await translate('card_number_placeholder')}
      expirationDateText={await translate('expiration_date')}
      cardBirthdayText={await translate('card_birthday_placeholder')}
      cardPasswordTwoDigitsText={await translate('card_password_two_digits_placeholder')}
      cancelText={await translate('cancel')}
      confirmText={await translate('confirm')}
    />
  )
}