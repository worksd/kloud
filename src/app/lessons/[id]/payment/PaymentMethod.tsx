'use client'
import React, { useState } from "react";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { SelectablePassList } from "@/app/lessons/[id]/payment/SelectablePassList";
import { GetPaymentMethodResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { SelectableBillingList } from "@/app/profile/setting/paymentMethod/BillingCardForm";
import { BankCode, BankOrCardIcon, pickBankKey } from "@/app/components/Bank";
import { BankSelectBottomSheet } from "@/app/components/BankSheet";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { Locale } from "@/shared/StringResource";
import { InlineCardForm } from "@/app/lessons/[id]/payment/InlineCardForm";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";
import { addBillingAction } from "@/app/profile/setting/paymentMethod/add.billing.action";
import { getLocaleString } from "@/app/components/locale";
import { formatAccountNumber } from "@/utils/format.account";
import NaverPayIcon from "@/../public/assets/ic_naver_pay.svg";
import KakaoPayIcon from "@/../public/assets/ic_kakao_pay.svg";
import TossPayIcon from "@/../public/assets/ic_toss_payments.svg";

type RefundAccount = {
  bankName?: string;
  accountNumber?: string;
  holderName?: string;
};

const EASY_PAY_TYPES: PaymentMethodType[] = ['naver_pay', 'kakao_pay', 'toss_pay'];

const isEasyPayType = (type: PaymentMethodType) => EASY_PAY_TYPES.includes(type);

const compareVersion = (a: string, b: string): number => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
};

const isEasyPaySupported = (os?: string, appVersion?: string): boolean => {
  if (!appVersion?.trim()) return true; // 웹
  if (os === 'iOS') return compareVersion(appVersion, '1.0.23') >= 0;
  if (os === 'Android') return compareVersion(appVersion, '1.0.37') >= 0;
  return false;
};

const EasyPayLogo = ({type, size = 22}: { type: PaymentMethodType, size?: number }) => {
  const wideSize = Math.round(size * 0.85);
  switch (type) {
    case 'naver_pay':
      return <NaverPayIcon style={{height: wideSize, width: Math.round(wideSize * 277 / 105)}} />;
    case 'kakao_pay':
      return <KakaoPayIcon style={{height: wideSize, width: Math.round(wideSize * 192.9 / 45)}} />;
    case 'toss_pay':
      return <TossPayIcon style={{height: size * 0.55, width: Math.round(size * 0.55 * 5500 / 897.75)}} />;
    default:
      return null;
  }
};

const PaymentMethodIcon = ({type, selected}: { type: PaymentMethodType, selected: boolean }) => {
  const color = selected ? '#111' : '#BDBDBD';
  switch (type) {
    case 'credit':
      // 카드 + NFC 무선 결제 표시
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="5.5" width="15" height="11" rx="2" stroke={color} strokeWidth="1.4"/>
          <path d="M1.5 9H16.5" stroke={color} strokeWidth="1.4"/>
          <path d="M4.5 13H8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M17 10.5C18 9.8 18.7 8.7 18.7 7.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M18.5 12C19.8 11 20.7 9.4 20.7 7.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      );
    case 'account_transfer':
      // 은행 건물
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 3L2.5 8.5H19.5L11 3Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M4.5 8.5V16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M9 8.5V16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M13 8.5V16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M17.5 8.5V16" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M2.5 16H19.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M2 18.5H20" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      );
    case 'pass':
      // 티켓/패스권 (양쪽 반원 노치)
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5H18C18.8 5 19.5 5.7 19.5 6.5V9.2C18.4 9.5 17.5 10.4 17.5 11.5C17.5 12.6 18.4 13.5 19.5 13.8V15.5C19.5 16.3 18.8 17 18 17H4C3.2 17 2.5 16.3 2.5 15.5V13.8C3.6 13.5 4.5 12.6 4.5 11.5C4.5 10.4 3.6 9.5 2.5 9.2V6.5C2.5 5.7 3.2 5 4 5Z" stroke={color} strokeWidth="1.4"/>
          <path d="M8.5 8L13.5 15" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="9" cy="14" r="1.2" stroke={color} strokeWidth="1.2"/>
          <circle cx="13" cy="8.5" r="1.2" stroke={color} strokeWidth="1.2"/>
        </svg>
      );
    case 'billing':
      // 카드 + 별(즐겨찾기) 표시
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="5.5" width="15" height="11" rx="2" stroke={color} strokeWidth="1.4"/>
          <path d="M1.5 9H16.5" stroke={color} strokeWidth="1.4"/>
          <path d="M4.5 13H8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M18.5 4.5L19.1 6.1H20.8L19.4 7.1L19.9 8.7L18.5 7.7L17.1 8.7L17.6 7.1L16.2 6.1H17.9L18.5 4.5Z" fill={color}/>
        </svg>
      );
    case 'foreign_card':
      // 해외 카드 (카드 + 지구본)
      return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1.5" y="5.5" width="15" height="11" rx="2" stroke={color} strokeWidth="1.4"/>
          <path d="M1.5 9H16.5" stroke={color} strokeWidth="1.4"/>
          <path d="M4.5 13H8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="17.5" cy="14.5" r="4" stroke={color} strokeWidth="1.2"/>
          <path d="M17.5 10.5C16 12 16 17 17.5 18.5" stroke={color} strokeWidth="1"/>
          <path d="M17.5 10.5C19 12 19 17 17.5 18.5" stroke={color} strokeWidth="1"/>
          <path d="M13.5 14.5H21.5" stroke={color} strokeWidth="1"/>
        </svg>
      );
    default:
      return null;
  }
};

export const PaymentMethodComponent = ({
                                         locale,
                                         paymentOptions,
                                         passes,
                                         cards,
                                         onCardsChangeAction,
                                         selectedPass,
                                         selectPass,
                                         selectedMethod,
                                         selectedBillingCard,
                                         selectBillingCard,
                                         selectPaymentMethodAction,
                                         depositor,
                                         setDepositorAction,
                                         refundAccount,
                                         os,
                                         appVersion,
                                         titleOverride,
                                       }: {
  locale: Locale,
  paymentOptions: GetPaymentMethodResponse[],
  passes?: GetPassResponse[],
  cards: GetBillingResponse[],
  onCardsChangeAction: (billing: GetBillingResponse[]) => void,
  selectedPass?: GetPassResponse,
  selectPass?: (pass: GetPassResponse) => void,
  selectedBillingCard?: GetBillingResponse,
  selectBillingCard?: (billing: GetBillingResponse) => void,
  selectedMethod?: PaymentMethodType,
  selectPaymentMethodAction: (method: PaymentMethodType) => void,
  depositor: string,
  setDepositorAction: (value: string) => void,
  refundAccount?: RefundAccount | null,
  os?: string,
  appVersion?: string,
  titleOverride?: string,
}) => {

  const [showInlineCardForm, setShowInlineCardForm] = useState(false);
  const [newCardForm, setNewCardForm] = useState<CreateBillingRequest | null>(null);
  const [addingCard, setAddingCard] = useState(false);

  // 환불계좌 inline 편집
  const [editingRefund, setEditingRefund] = useState(!refundAccount?.accountNumber);
  const [refundBank, setRefundBank] = useState(refundAccount?.bankName ?? '');
  const [refundNumber, setRefundNumber] = useState(refundAccount?.accountNumber ?? '');
  const [refundHolder, setRefundHolder] = useState(refundAccount?.holderName ?? '');
  const [bankSheetOpen, setBankSheetOpen] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState<BankCode | 'other' | undefined>(
    () => pickBankKey(refundAccount?.bankName ?? '')
  );
  const [savingRefund, setSavingRefund] = useState(false);

  const handleAddCard = async () => {
    if (!newCardForm) return;
    setAddingCard(true);
    const billingRes = await addBillingAction(newCardForm);
    if ('billingKey' in billingRes && billingRes.billingKey) {
      setShowInlineCardForm(false);
      setNewCardForm(null);
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.reload();
    } else if ('pgMessage' in billingRes) {
      const { createDialog } = await import("@/utils/dialog.factory");
      const dialog = await createDialog({
        id: 'Simple',
        title: getLocaleString({locale, key: 'billing_register_fail_title'}),
        message: billingRes.pgMessage ?? ''
      });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    } else if ('message' in billingRes) {
      const { createDialog } = await import("@/utils/dialog.factory");
      const dialog = await createDialog({
        id: 'Simple',
        title: getLocaleString({locale, key: 'billing_register_fail_title'}),
        message: (billingRes as { message: string }).message
      });
      window.KloudEvent?.showDialog(JSON.stringify(dialog));
    }
    setAddingCard(false);
  };

  const handleSaveRefund = async () => {
    if (!refundBank || !refundNumber || !refundHolder) return;
    setSavingRefund(true);
    const res = await updateUserAction({
      refundAccountBank: refundBank,
      refundAccountNumber: refundNumber.replace(/-/g, ''),
      refundDepositor: refundHolder,
    });
    setSavingRefund(false);
    if (res.success) {
      setEditingRefund(false);
    }
  };

  const handleOnSuccessAddBillingCard = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    window.location.reload();
  }

  const regularOptions = paymentOptions.filter(o => !isEasyPayType(o.type));
  const easyPayOrder: PaymentMethodType[] = ['naver_pay', 'kakao_pay', 'toss_pay'];
  const easyPayOptions = isEasyPaySupported(os, appVersion)
    ? paymentOptions
      .filter(o => isEasyPayType(o.type))
      .sort((a, b) => easyPayOrder.indexOf(a.type) - easyPayOrder.indexOf(b.type))
    : [];

  if (paymentOptions.length === 0) return null;

  return (
    <div className="flex flex-col gap-y-2 px-6 mt-2">
      <div className="text-[15px] font-bold text-black">
        {titleOverride ?? getLocaleString({locale, key: 'payment_method'})}
      </div>

      <div className="rounded-2xl border border-[#EEEFF0] overflow-hidden">
        {/* 일반 결제수단 리스트 */}
        {regularOptions.map((option, index) => {
          const isSelected = selectedMethod === option.type;
          const isLast = index === regularOptions.length - 1 && easyPayOptions.length === 0;
          return (
            <div key={option.id} className="flex flex-col">
              <div
                onClick={() => selectPaymentMethodAction(option.type)}
                className={`flex items-center gap-3 px-5 py-[15px] cursor-pointer transition-all duration-150 select-none
                  ${isSelected ? 'bg-[#F0F1F3]' : 'bg-white hover:bg-[#FBFBFC]'}
                  ${!isLast && !isSelected ? 'border-b border-[#F0F0F0]' : ''}`}
              >
                <PaymentMethodIcon type={option.type} selected={isSelected} />
                <div className={`flex-grow text-[14px] transition-colors duration-150
                  ${isSelected ? 'text-black font-bold' : 'text-[#888] font-medium'}`}>
                  {option.name}
                </div>
                <div className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all duration-150
                  ${isSelected ? 'border-black bg-black' : 'border-[#D4D4D4]'}`}>
                  {isSelected && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>

              {/* 확장 영역 */}
              {isSelected && option.type === 'pass' && (
                <div className="bg-[#F6F7F8] px-5 pb-4">
                  {passes && passes.length > 0 && selectPass ? (
                    <SelectablePassList
                      passItems={passes}
                      onSelect={selectPass}
                      selectedPassId={selectedPass?.id ?? null}
                      locale={locale}
                    />
                  ) : (
                    <div className="py-4 text-center text-[13px] text-[#999] bg-white rounded-xl mt-2">
                      {getLocaleString({locale, key: 'no_available_pass'})}
                    </div>
                  )}
                </div>
              )}

              {isSelected && option.type === 'account_transfer' && (
                <div className="bg-[#F6F7F8] px-5 pb-4">
                  {/* 입금자명 */}
                  <div className="mt-3 rounded-xl border border-[#E8E8E8] bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                      <span className="text-[13px] font-bold text-black">
                        {getLocaleString({locale, key: 'depositor_name'})}
                      </span>
                      <span className="text-[11px] font-medium text-[#E55B5B]">
                        {getLocaleString({locale, key: 'required'})}
                      </span>
                    </div>
                    <div className="px-4 pb-3">
                      <input
                        type="text"
                        placeholder={getLocaleString({locale, key: 'input_name_message'})}
                        className="border border-[#EEEFF0] rounded-lg px-3.5 py-2.5 text-[14px] text-black w-full bg-[#FAFBFC]
                                   focus:border-black focus:bg-white focus:outline-none transition-colors"
                        value={depositor}
                        onChange={(e) => setDepositorAction(e.target.value)}
                        onFocus={(e) => {
                          setTimeout(() => e.target.scrollIntoView({behavior: 'smooth', block: 'center'}), 300);
                        }}
                      />
                      <p className="text-[11px] text-[#ACACAC] mt-2 leading-snug">
                        {getLocaleString({locale, key: 'depositor_name_warning'})}
                      </p>
                    </div>
                  </div>

                  {/* 환불계좌 */}
                  <div className="mt-2 rounded-xl border border-[#E8E8E8] bg-white overflow-hidden">
                    <div className="flex items-center justify-between px-4 pt-3 pb-1">
                      <span className="text-[13px] font-bold text-black">
                        {getLocaleString({locale, key: 'refund_account'})}
                      </span>
                      {!editingRefund && (
                        <button
                          type="button"
                          onClick={() => setEditingRefund(true)}
                          className="text-[12px] font-medium text-[#888] underline active:text-black transition-colors"
                        >
                          {getLocaleString({locale, key: 'edit'})}
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#ACACAC] px-4 pb-2 leading-snug">
                      {getLocaleString({locale, key: 'refund_account_desc'})}
                    </p>

                    {editingRefund ? (
                      <div className="px-4 pb-4 flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={() => setBankSheetOpen(true)}
                          className="w-full flex items-center justify-between rounded-lg border border-[#EEEFF0] px-3.5 py-2.5 bg-[#FAFBFC]"
                        >
                          <div className="flex items-center gap-2">
                            {selectedBankCode && selectedBankCode !== 'other' ? (
                              <BankOrCardIcon name={selectedBankCode} size={20}/>
                            ) : (
                              <div className="w-5 h-5 rounded bg-[#EEEFF0]" />
                            )}
                            <span className={`text-[14px] ${refundBank ? 'text-black' : 'text-[#BDBDBD]'}`}>
                              {refundBank || getLocaleString({locale, key: 'input_refund_account_bank'})}
                            </span>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#999" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>

                        {selectedBankCode === 'other' && (
                          <input
                            type="text"
                            placeholder={getLocaleString({locale, key: 'input_refund_account_bank'})}
                            className="border border-[#EEEFF0] rounded-lg px-3.5 py-2.5 text-[14px] text-black w-full bg-[#FAFBFC]
                                       focus:border-black focus:bg-white focus:outline-none transition-colors"
                            value={refundBank === '기타' ? '' : refundBank}
                            onChange={(e) => setRefundBank(e.target.value)}
                            onFocus={(e) => {
                              setTimeout(() => e.target.scrollIntoView({behavior: 'smooth', block: 'center'}), 300);
                            }}
                          />
                        )}

                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder={getLocaleString({locale, key: 'input_refund_account_number'})}
                          className="border border-[#EEEFF0] rounded-lg px-3.5 py-2.5 text-[14px] text-black w-full bg-[#FAFBFC]
                                     focus:border-black focus:bg-white focus:outline-none transition-colors"
                          value={refundNumber}
                          onChange={(e) => setRefundNumber(e.target.value)}
                          onFocus={(e) => {
                            setTimeout(() => e.target.scrollIntoView({behavior: 'smooth', block: 'center'}), 300);
                          }}
                        />

                        <input
                          type="text"
                          placeholder={getLocaleString({locale, key: 'input_refund_account_depositor'})}
                          className="border border-[#EEEFF0] rounded-lg px-3.5 py-2.5 text-[14px] text-black w-full bg-[#FAFBFC]
                                     focus:border-black focus:bg-white focus:outline-none transition-colors"
                          value={refundHolder}
                          onChange={(e) => setRefundHolder(e.target.value)}
                          onFocus={(e) => {
                            setTimeout(() => e.target.scrollIntoView({behavior: 'smooth', block: 'center'}), 300);
                          }}
                        />

                        <button
                          type="button"
                          onClick={handleSaveRefund}
                          disabled={!refundBank || !refundNumber || !refundHolder || savingRefund}
                          className="w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors
                                     disabled:bg-[#F0F0F0] disabled:text-[#BDBDBD]
                                     bg-black text-white active:scale-[0.98]"
                        >
                          {savingRefund ? '...' : getLocaleString({locale, key: 'confirm'})}
                        </button>

                        <BankSelectBottomSheet
                          open={bankSheetOpen}
                          selected={selectedBankCode}
                          onClose={() => setBankSheetOpen(false)}
                          onSelect={(code, label) => {
                            setSelectedBankCode(code);
                            setRefundBank(label);
                            setBankSheetOpen(false);
                          }}
                          title={getLocaleString({locale, key: 'refund_account_bank'})}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-3 px-4 pb-3 cursor-pointer active:bg-[#F6F7F8] transition-colors rounded-b-xl"
                        onClick={() => setEditingRefund(true)}
                      >
                        {refundBank && (
                          <BankOrCardIcon name={refundBank} size={24}/>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-black truncate">
                            {refundBank}
                            {refundHolder && (
                              <span className="ml-1 text-[12px] text-[#888] font-normal">({refundHolder})</span>
                            )}
                          </div>
                          <div className="text-[12px] text-[#999] tracking-wide">
                            {formatAccountNumber(refundNumber, refundBank)}
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                          <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="#999" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isSelected && option.type === 'billing' && selectBillingCard && (
                <div className="bg-[#F6F7F8] px-5 pb-4">
                  <div className="flex flex-col">
                    <SelectableBillingList
                      billingCards={cards ?? []}
                      selectedBillingKey={selectedBillingCard}
                      onSelectAction={(card) => {
                        selectBillingCard(card);
                        setShowInlineCardForm(false);
                        setNewCardForm(null);
                      }}
                      locale={locale}
                    />
                    <button
                      onClick={() => setShowInlineCardForm(prev => !prev)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-dashed border-[#D0D0D0] bg-white
                                 text-[#888] text-[13px] font-medium active:bg-[#F5F5F5] transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {getLocaleString({locale, key: 'add_new_card'})}
                    </button>
                    {showInlineCardForm && (
                      <>
                        <InlineCardForm
                          locale={locale}
                          onCardInfoChange={(form) => setNewCardForm(form)}
                        />
                        <button
                          type="button"
                          onClick={handleAddCard}
                          disabled={!newCardForm || addingCard}
                          className="mt-2 w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors
                                     disabled:bg-[#F0F0F0] disabled:text-[#BDBDBD]
                                     bg-black text-white active:scale-[0.98]"
                        >
                          {addingCard ? '...' : getLocaleString({locale, key: 'add_new_card'})}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 간편결제 영역 */}
        {easyPayOptions.length > 0 && (
          <div className="border-t border-[#F0F0F0] px-4 py-3.5 bg-white">
            <div className="text-[12px] font-bold text-[#999] mb-2.5">
              {getLocaleString({locale, key: 'easy_payment'})}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {easyPayOptions.map((option) => {
                const isSelected = selectedMethod === option.type;
                return (
                  <button
                    key={option.id}
                    onClick={() => selectPaymentMethodAction(option.type)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-[1.5px] transition-all duration-150 select-none active:scale-[0.97]
                      ${isSelected
                        ? 'border-black bg-[#F6F7F8]'
                        : 'border-[#EEEFF0] bg-white hover:bg-[#FBFBFC]'}`}
                  >
                    <EasyPayLogo type={option.type} size={24} />
                    <span className={`text-[11px] font-medium ${isSelected ? 'text-black' : 'text-[#999]'}`}>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
