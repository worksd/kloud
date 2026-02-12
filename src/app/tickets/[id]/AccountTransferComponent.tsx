import { translate } from "@/utils/translate";
import { formatAccountNumber } from "@/utils/format.account";

export const AccountTransferComponent = async ({title, depositor, bank, accountNumber, price} : {
  title?: string
  depositor?: string
  bank?: string
  accountNumber?: string
  price?: number
}) => {
  return (
    <div className="flex flex-col p-4 border rounded-lg bg-gray-100 justify-center">
      <div className="text-sm font-bold text-gray-700">{title}</div>
      <div className="text-sm font-bold text-gray-700">{await translate('bank_transfer_message')}</div>
      <div className="text-sm font-bold text-gray-700">{await translate('bank_transfer_description')}</div>

      <div className="flex flex-col mt-2 p-3 bg-white rounded-lg shadow">
        <div className="text-gray-500 text-sm">{await translate('depositor')}</div>
        <div className="font-bold text-lg text-black">{depositor}</div>

        <div className="text-gray-500 text-sm">{await translate('bank')}</div>
        <div className="font-bold text-lg text-black">{bank}</div>

        <div className="mt-2 text-gray-500 text-sm">{await translate('account_number')}</div>
        <div className="font-medium text-base text-black">{formatAccountNumber(accountNumber, bank)}</div>

        <div className="mt-4 text-gray-500 text-sm">{await translate('deposit_amount')}</div>
        <div className="font-bold text-xl text-red-500">
          {new Intl.NumberFormat("ko-KR").format(price ?? 0)}원
        </div>
      </div>
    </div>
  )
}