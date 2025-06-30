'use client'
import { useEffect, useState } from "react";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";
import { deleteBillingAction } from "@/app/profile/setting/paymentMethod/delete.billing.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { TranslatableText } from "@/utils/TranslatableText";

export const BillingCardForm = ({cards}: { cards: GetBillingResponse[] }) => {
  const [newCards, setCards] = useState<GetBillingResponse[]>(cards)
  const [isDeleting, setIsDeleting] = useState(false);


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
        }
        setIsDeleting(false);

      }
    }
  }, []);

  const showDeleteDialog = async ({card}: { card: GetBillingResponse }) => {
    const dialog = await createDialog({id: `DeleteBillingCard`, message: `${card.cardName} (${card.cardNumber})`, customData: card.billingKey});
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
            window.KloudEvent.showBottomSheet(KloudScreen.PaymentMethodAddSheet(KloudScreen.PaymentMethodSetting))
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black text-3xl drop-shadow-lg hover:bg-gray-200 transition"
          aria-label="카드 추가"
        >
          +
        </button>

        {newCards.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <TranslatableText titleResource={'no_registered_payment_method_message'} className="text-[22px] font-bold text-black"/>
            <TranslatableText titleResource={'press_right_bottom_button_message'}/>
          </div>
        ) : (
          <BillingCardList cards={newCards} onDelete={async (card: GetBillingResponse) => {
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
            <TranslatableText titleResource={'delete_payment_method_message'}/>
          </div>
        </div>
      )}
    </main>
  )
}

function BillingCardList({
                           cards,
                           onDelete,
                         }: {
  cards: GetBillingResponse[]
  onDelete: (card: GetBillingResponse) => void
}) {
  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      {cards.map(card => (
        <BillingCard
          key={card.billingKey}
          cardNumber={card.cardNumber}
          cardName={card.cardName}
          onDelete={() => onDelete(card)}
        />
      ))}
    </div>
  )
}

export const SelectableBillingList = ({
                                        billingCards,
                                        selectedBillingKey,
                                        onSelectAction,
                                      }: {
  billingCards: GetBillingResponse[];
  selectedBillingKey?: GetBillingResponse;
  onSelectAction: (billingKey: GetBillingResponse) => void;
}) => {
  return (
    <div className="flex flex-col mt-2 space-y-2">
      {billingCards.map((card, index) => (
        <div key={card.billingKey}>
          <div
            onClick={() => onSelectAction(card)}
            className="cursor-pointer transition-all duration-200"
          >
            <BillingCard
              cardName={card.cardName}
              cardNumber={card.cardNumber}
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
                     }: {
  cardName: string;
  cardNumber: string;
  onDelete?: () => void;
  isSelected?: boolean;
}) {
  const maskedNumber = `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 8)} **** ${cardNumber.slice(-4)}`;

  return (
    <div
      className={`relative rounded-2xl px-6 py-4 shadow-sm transition-all duration-200 text-black border
        ${isSelected ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'}`}
    >
      {onDelete && (
        <TranslatableText
          onClick={onDelete}
          className="absolute top-2 right-4 bottom-2 text-xs text-red-500 font-bold"
          titleResource={'delete'}
        >
        </TranslatableText>
      )}

      <div className="space-y-1">
        <div className="text-lg font-semibold">{cardName}</div>
        <div className={`text-sm tracking-widest ${isSelected ? 'text-neutral-600' : 'text-neutral-400'}`}>
          {maskedNumber}
        </div>
      </div>
    </div>
  );
}