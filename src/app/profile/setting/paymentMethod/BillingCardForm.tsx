'use client'
import { useEffect, useState } from "react";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { KloudScreen } from "@/shared/kloud.screen";
import { getBillingListAction } from "@/app/profile/setting/paymentMethod/get.billing.list.action";
import { deleteBillingAction } from "@/app/profile/setting/paymentMethod/delete.billing.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";

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
        setIsDeleting(true); // ✅ 삭제 시작
        const res = await deleteBillingAction({billingKey: data.customData ?? ''})
        if ('success' in res && res.success) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await loadCards()
        }
        setIsDeleting(false); // ✅ 삭제 완료

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
            window.KloudEvent.showBottomSheet(KloudScreen.PaymentMethodAddSheet)
          }}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-white text-black text-3xl drop-shadow-lg hover:bg-gray-200 transition"
          aria-label="카드 추가"
        >
          +
        </button>

        {newCards.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-[22px] font-bold text-black">등록된 결제 수단이 없습니다.</p>
            <p className="text-sm mt-2">우측 하단 <span className="font-bold">+</span> 버튼을 눌러 추가해주세요.</p>
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
            <span>결제 수단을 삭제하고 있습니다.</span>
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

function BillingCard({
                       cardName,
                       cardNumber,
                       onDelete,
                     }: {
  cardName: string
  cardNumber: string
  onDelete?: () => void
}) {
  const maskedNumber = `${cardNumber.slice(0, 4)} ${cardNumber.slice(4, 8)} **** ${cardNumber.slice(-4)}`
  return (
    <div
      className="relative bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 shadow-md flex items-center justify-between">
      <div className="space-y-1">
        <div className="text-lg font-semibold text-white">{cardName}</div>
        <div className="text-sm text-neutral-400 tracking-widest">{maskedNumber}</div>
      </div>

      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-4 right-4 text-xs text-red-400 hover:text-red-300 font-bold"
        >
          삭제
        </button>
      )}

    </div>
  )
}

export const SelectableBillingList = ({
                                        billingCards,
                                        selectedBillingKey,
                                        onSelectAction,
                                      }: {
  billingCards: GetBillingResponse[];
  selectedBillingKey: GetBillingResponse | undefined;
  onSelectAction: (billingKey: GetBillingResponse) => void;
}) => {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide mt-4">
      {billingCards.map((card, index) => (
        <div
          key={card.billingKey}
          className={`snap-start ${
            index === billingCards.length - 1 ? 'pr-6' : ''
          } ${index === 0 ? 'pl-4' : ''} min-w-[calc(100vw-32px)]`}
        >
          <div
            onClick={() => onSelectAction(card)}
            className={`cursor-pointer transition-all duration-200 ${
              selectedBillingKey === card
                ? 'ring-2 ring-primary'
                : ''
            }`}
          >
            <BillingCard
              cardName={card.cardName}
              cardNumber={card.cardNumber}
            />
          </div>
        </div>
      ))}
    </div>
  );
};