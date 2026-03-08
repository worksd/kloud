'use client'

import { Locale, StringResourceKey } from "@/shared/StringResource";
import { PaymentMethodType, DiscountResponse } from "@/app/endpoint/payment.endpoint";
import { getLocaleString } from "@/app/components/locale";
import AliPayIcon from "@/../public/assets/ic_ali_pay.svg";
import WechatPayIcon from "@/../public/assets/ic_wechat_pay.svg";
import NaverPayIcon from "@/../public/assets/ic_naver_pay.svg";
import KakaoPayIcon from "@/../public/assets/ic_kakao_pay.svg";
import TossPayIcon from "@/../public/assets/ic_toss_payments.svg";

const METHOD_LABEL: Record<PaymentMethodType, string> = {
  credit: '카드결제',
  account_transfer: '계좌이체',
  pass: '패스',
  billing: '카드결제',
  admin: '관리자',
  ALIPAY: 'Alipay',
  WECHAT_PAY: 'WeChat Pay',
  NAVER_PAY: '네이버페이',
  KAKAO_PAY: '카카오페이',
  TOSS_PAY: '토스페이',
};

const EASY_PAY_TYPES: PaymentMethodType[] = ['NAVER_PAY', 'KAKAO_PAY', 'TOSS_PAY', 'ALIPAY', 'WECHAT_PAY'];

const EasyPayMiniLogo = ({type}: { type: PaymentMethodType }) => {
  const h = 16;
  switch (type) {
    case 'NAVER_PAY':
      return <NaverPayIcon style={{height: h, width: Math.round(h * 277 / 105)}} />;
    case 'KAKAO_PAY':
      return <KakaoPayIcon style={{height: h, width: Math.round(h * 192.9 / 80.4)}} />;
    case 'TOSS_PAY':
      return <TossPayIcon style={{height: h * 0.75, width: Math.round(h * 0.75 * 5500 / 897.75)}} />;
    case 'ALIPAY':
      return <AliPayIcon style={{width: h, height: h}} />;
    case 'WECHAT_PAY':
      return <WechatPayIcon style={{width: h, height: h}} />;
    default:
      return null;
  }
};

export const PurchaseInformation = ({originalPrice, totalPrice, method, titleResource, locale, discounts}: {
  originalPrice: number,
  totalPrice: number,
  method?: PaymentMethodType,
  titleResource: StringResourceKey,
  locale: Locale,
  discounts?: DiscountResponse[]
}) => {

  const hasDiscount = discounts && discounts.length > 0;
  const fmt = (n: number) => new Intl.NumberFormat("ko-KR").format(n);
  const won = getLocaleString({locale, key: 'won'});
  const finalPrice = method == 'pass' ? 0 : totalPrice;

  return (
    <div className="flex flex-col px-6">
      <div className="text-[15px] font-bold text-black mb-4">{getLocaleString({
        locale,
        key: 'payment_information'
      })}</div>

      <div className="rounded-2xl border border-[#EEEFF0] bg-[#FAFBFC] overflow-hidden">
        {/* 상품 가격 */}
        <div className="flex justify-between items-center px-5 py-3.5">
          <span className="text-[13px] text-[#666]">{getLocaleString({locale, key: titleResource})}</span>
          <span className="text-[14px] font-semibold text-black">{fmt(originalPrice)}{won}</span>
        </div>

        {/* 할인 항목들 */}
        {hasDiscount && (
          <>
            <div className="mx-5 h-px bg-[#EEEFF0]" />
            <div className="px-5 py-3">
              <div className="text-[12px] font-bold text-[#888] uppercase tracking-wide mb-2">
                {getLocaleString({locale, key: 'discount_info'})}
              </div>
              <div className="flex flex-col gap-y-1.5">
                {discounts.map((discount, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-[13px] text-[#666]">{discount.key}</span>
                    <span className="text-[13px] font-semibold text-[#FF3B30]">
                      -{fmt(parseInt(discount.value.replace(/,/g, '')))}{won}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 결제수단 */}
        {(method || totalPrice === 0) && (
          <>
            <div className="mx-5 h-px bg-[#EEEFF0]" />
            <div className="flex justify-between items-center px-5 py-3.5">
              <span className="text-[13px] text-[#666]">{getLocaleString({locale, key: 'payment_method_select'})}</span>
              <span className="text-[14px] font-semibold text-black flex items-center gap-1.5">
                {totalPrice === 0 && method !== 'pass'
                  ? getLocaleString({locale, key: 'free_payment'})
                  : method && (<>{EASY_PAY_TYPES.includes(method) && <EasyPayMiniLogo type={method} />}{METHOD_LABEL[method]}</>)
                }
              </span>
            </div>
          </>
        )}

        {/* 총 결제금액 */}
        <div className="bg-black mx-3 mb-3 mt-1 rounded-xl px-5 py-4 flex justify-between items-center">
          <span className="text-[13px] font-semibold text-white/70">{getLocaleString({locale, key: 'total_amount'})}</span>
          <span className="text-[18px] font-bold text-white">{fmt(finalPrice)}{won}</span>
        </div>
      </div>
    </div>
  )
}
