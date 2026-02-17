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
    <div className="flex flex-col mt-4 rounded-2xl bg-[#F7F8F9] overflow-hidden">
      {/* 안내 문구 */}
      <div className="px-5 pt-5 pb-4">
        {title && <div className="text-[14px] font-bold text-black mb-1">{title}</div>}
        <p className="text-[13px] text-[#86898C] leading-relaxed">
          {await translate('bank_transfer_description')}{' '}
          {await translate('bank_transfer_message')}
        </p>
      </div>

      {/* 계좌 정보 */}
      <div className="mx-4 mb-4 rounded-xl bg-white p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#86898C]">{await translate('bank')}</span>
          <span className="text-[14px] text-black font-medium">{bank}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#86898C]">{await translate('account_number')}</span>
          <span className="text-[14px] text-black font-medium">{formatAccountNumber(accountNumber, bank)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#86898C]">{await translate('depositor')}</span>
          <span className="text-[14px] text-black font-medium">{depositor}</span>
        </div>

        {price != null && (
          <>
            <div className="border-t border-[#F1F3F6]"/>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#86898C]">{await translate('deposit_amount')}</span>
              <span className="text-[18px] text-black font-extrabold">
                {new Intl.NumberFormat("ko-KR").format(price)}원
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
