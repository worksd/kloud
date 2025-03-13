'use client'
import DropdownDetails from "@/app/components/DropdownDetail";
import { useLocale } from "@/hooks/useLocale";
import { useState } from "react";
import { StringResource, StringResourceKey } from "@/shared/StringResource";
import { SellerInfoItem } from "@/app/lessons/[id]/payment/payment.info";
import { GetStudioResponse } from "@/app/endpoint/studio.endpoint";
import PassPaymentButton from "@/app/pass/[id]/payment/PassPaymentButton";

export const PassPaymentInfo = ({studio, price}: { studio: GetStudioResponse, price: number }) => {
  const {t} = useLocale()
  const [selectedMethod, setSelectedMethod] = useState("credit_card");
  const [depositor, setDepositor] = useState("");

  const paymentOptions: { id: string, label: StringResourceKey }[] = [
    {id: "credit", label: "credit_card"},
    {id: "bank", label: "account_transfer"},
  ];
  return (
    <div className={"flex flex-col justify-between"}>
      <div>
        <div className="flex flex-col gap-y-4 px-6">
          <p className="text-base font-bold text-left text-black">{t('payment_method')}</p>
          {paymentOptions.map((option) => (
            <label
              key={option.id}
              className={`w-full flex items-center h-[52px] relative gap-2 pl-4 pr-2 py-2 rounded-lg border 
            ${selectedMethod === option.label ? "border-black bg-gray-100" : "border-gray-300"}
            cursor-pointer transition-all`}
            >
              <input
                type="checkbox"
                checked={selectedMethod === option.label}
                onChange={() => setSelectedMethod(option.label)}
                className="w-5 h-5 accent-black cursor-pointer"
              />
              <p className="flex-grow text-sm font-medium text-left text-black">
                {t(option.label)}
              </p>
            </label>
          ))}
        </div>

        {
          selectedMethod === 'account_transfer' &&
          <div className="flex flex-col space-y-3 p-4 text-black px-6">
            {/* 입력 필드 */}
            <div className="flex flex-col space-y-3 ">
              <label className="text-base text-left font-bold">
                입금자명 <span className="text-[#E55B5B] text-[14px] font-medium">필수</span>
              </label>
              <input
                type="text"
                placeholder={t('input_name_message')}
                className="border border-gray-300 rounded-lg p-4 text-[14px] w-full disabled:bg-gray-100
             focus:border-black focus:text-black focus:outline-none"
                value={depositor}
                onChange={(e) => setDepositor(e.target.value)}
              />
            </div>
          </div>
        }

        <div className="py-5">
          <div className="w-full h-[1px] bg-[#F7F8F9] "/>
        </div>

        {/* 결제 정보 */
        }
        <div className="flex flex-col gap-y-4 px-6">
          <p className="text-base font-bold text-left text-black">{t('payment_information')}</p>

          <div className="flex flex-col gap-y-2">
            <div className="flex justify-between text-sm font-medium text-center text-black">
              <p>{t('lesson_price')}</p>
              <p>{new Intl.NumberFormat("ko-KR").format(price)} {t('won')}</p>
            </div>

            <div className="flex justify-between text-[10px] font-medium text-center text-[#86898c]">
              <p>{t('one_ticket')}</p>
              <p>{new Intl.NumberFormat("ko-KR").format(price)} {t('won')}</p>
            </div>
          </div>

          <div className="w-full h-px bg-[#D7DADD]"/>

          <div className="flex justify-between text-base font-bold text-center text-black">
            <p>{t('total_amount')}</p>
            <p>{new Intl.NumberFormat("ko-KR").format(price)} {t('won')}</p>
          </div>
        </div>

        <div className="py-5">
          <div className="w-full h-3 bg-[#F7F8F9] "/>
        </div>

        <div className="flex flex-col gap-y-5 px-6">
          {/* 판매자 정보 */}
          <DropdownDetails title={t('seller_information')}>
            <SellerInfoItem label={t('business_name')} value={studio?.businessName ?? ''}/>
            {studio?.businessRegistrationNumber &&
              <SellerInfoItem label={t('business_registration_number')}
                              value={studio.businessRegistrationNumber}/>}
            {studio?.eCommerceRegNumber &&
              <SellerInfoItem label={t('e_commerce_registration_number')} value={studio.eCommerceRegNumber}/>}
            {studio?.representative &&
              <SellerInfoItem label={t('representative')} value={studio.representative}/>}
            {studio?.educationOfficeRegNumber &&
              <SellerInfoItem label={t('education_office_registration_number')}
                              value={studio.educationOfficeRegNumber}/>}
            {studio?.address && <SellerInfoItem label={t('business_address')} value={studio.address}/>}
          </DropdownDetails>

          {/* 환불 안내 */}
          <DropdownDetails title={t('refund_information')}>
            <div className="text-[#86898c] text-[12px] font-medium">
              <p className="pb-4">{t('lesson_refund_message_1')}</p>
              <p>{t('lesson_refund_message_2')}</p>
            </div>

            <div
              className="mt-10 text-center text-[#6b6e71] text-[10px] font-medium leading-[14px]">
              <p className="pb-4">{t('lesson_refund_message_3')}</p>
              <p>{t('lesson_refund_message_4')}</p>
              <p>{t('lesson_refund_message_5')}</p>
            </div>
          </DropdownDetails>
        </div>


      </div>
      <div className="px-6 mt-4 bottom-0 sticky">
        <PassPaymentButton studioId={studio.id} os={'android'} title={'asdf'} price={10000} passId={3} disabled={false}
                           method={selectedMethod} depositor={depositor} userId={'3'}/>
      </div>
    </div>
  )
}