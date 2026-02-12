'use client'
import React, { useEffect, useState } from "react";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";
import { deleteBillingAction } from "@/app/profile/setting/paymentMethod/delete.billing.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { BankOrCardIcon } from "@/app/components/Bank";
import { PaymentMethodAddBottomSheet } from "@/app/components/popup/PaymentMethodBottomSheet";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const BillingCardForm = ({cards, locale}: { cards: GetBillingResponse[], locale: Locale }) => {
  const [newCards, setCards] = useState<GetBillingResponse[]>(cards)
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const loadCards = async () => {

    const res = await getBillingListAction()
    if ('billings' in res) setCards(res.billings)
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id == 'DeleteBillingCard') {
        setIsDeleting(true);
        const res = await deleteBillingAction({billingKey: data.customData ?? ''})
        if ('deletedAt' in res) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 이 코드 없으면 갱신안됨
          await loadCards()
        } else if (isGuinnessErrorCase(res)) {
          const dialog = await createDialog({
            id: 'Simple',
            title: res.message
          })
          window.KloudEvent.showDialog(JSON.stringify(dialog));
        }
        setIsDeleting(false);

      }
    }
  }, []);

  const showDeleteDialog = async ({card}: { card: GetBillingResponse }) => {
    const dialog = await createDialog({
      id: `DeleteBillingCard`,
      message: `${card.cardName} (${card.cardNumber})`,
      customData: card.billingKey
    });
    window.KloudEvent.showDialog(JSON.stringify(dialog))
  }

  useEffect(() => {
    window.onReload = async (data: ({ route: string })) => {
      await loadCards()
    }
  }, [])

  return (
    <main className="p-6">
      <div className="w-full max-w-md mx-auto relative">
        {/* + 버튼 */}
        <button
          onClick={() => {
            setOpen(true);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black text-3xl drop-shadow-lg hover:bg-gray-200 transition"
          aria-label="카드 추가"
        >
          +
        </button>

        {newCards.length === 0 ? (
          <div className="text-center text-gray-500 mt-60">
            <div className="text-[22px] font-bold text-black">{getLocaleString({
              locale,
              key: 'no_registered_payment_method_message'
            })}</div>
            <div>{getLocaleString({locale, key: 'press_right_bottom_button_message'})}</div>
          </div>
        ) : (
          <BillingCardList
            cards={newCards}
            locale={locale}
            onDelete={async (card: GetBillingResponse) => {
            await showDeleteDialog({card})
          }}/>
        )}
      </div>
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <svg
              className="w-5 h-5 animate-spin text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <div>{getLocaleString({locale, key: 'delete_payment_method_message'})}</div>
          </div>
        </div>
      )}
      {open && (
        <PaymentMethodAddBottomSheet open={open} locale={locale} onCloseAction={() => setOpen(false)}
                                     onSuccessAction={() => loadCards()}/>
      )}
    </main>
  )
}

function BillingCardList({
                           cards,
                           locale,
                           onDelete,
                         }: {
  cards: GetBillingResponse[]
  locale: Locale
  onDelete: (card: GetBillingResponse) => void
}) {
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {cards.map(card => (
        <BillingCard
          key={card.billingKey}
          cardNumber={card.cardNumber ?? ''}
          cardName={card.cardName ?? ''}
          onDelete={() => onDelete(card)}
          locale={locale}
        />
      ))}
    </div>
  )
}

export const SelectableBillingList = ({
                                        billingCards,
                                        selectedBillingKey,
                                        onSelectAction,
                                        locale,
                                      }: {
  billingCards: GetBillingResponse[];
  selectedBillingKey?: GetBillingResponse;
  onSelectAction: (billingKey: GetBillingResponse) => void;
  locale: Locale;
}) => {
  return (
    <div className="flex flex-col mt-3 space-y-2">
      {billingCards.map((card) => (
        <div key={card.billingKey}>
          <div
            onClick={() => onSelectAction(card)}
            className="cursor-pointer transition-all duration-200 active:scale-[0.98]"
          >
            <BillingCard
              locale={locale}
              cardName={card.cardName ?? ''}
              cardNumber={card.cardNumber ?? ''}
              isSelected={selectedBillingKey?.billingKey === card.billingKey}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

function BillingCard({
                       cardName,
                       cardNumber,
                       onDelete,
                       isSelected,
                       locale,
                     }: {
  cardName: string;
  cardNumber: string;
  onDelete?: () => void;
  isSelected?: boolean;
  locale: Locale;
}) {
  const maskedNumber = `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 8)} **** ${cardNumber.slice(-4)}`;

  return (
    <div
      className={`relative rounded-xl transition-all duration-200 text-black border
        ${isSelected
        ? 'border-[1.5px] border-black bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
        : 'border border-[#E8E8E8] bg-[#FAFAFA]'}`}
    >
      {onDelete && (
        <div
          onClick={onDelete}
          className="absolute top-4 right-4 text-[12px] text-[#E55B5B] font-semibold cursor-pointer"
        >
          {getLocaleString({locale, key: 'delete'})}
        </div>
      )}

      <div className="flex flex-row items-center p-4 gap-3">
        <div className={`w-[40px] h-[40px] rounded-xl flex items-center justify-center flex-shrink-0
          ${isSelected ? 'bg-[#F0F0F0]' : 'bg-[#F5F5F5]'}`}>
          <BankOrCardIcon name={cardName} scale={100}/>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className={`text-[15px] font-semibold ${isSelected ? 'text-black' : 'text-[#888]'}`}>{cardName}</div>
          <div className={`text-[13px] tracking-wider ${isSelected ? 'text-[#666]' : 'text-[#BCBCBC]'}`}>
            {maskedNumber}
          </div>
        </div>
        {isSelected && (
          <div className="w-[22px] h-[22px] rounded-full bg-black flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}