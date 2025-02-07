'use client'

import { useEffect, useState } from "react";
import CheckIcon from "../../../../../public/assets/check_white.svg"
import { KloudScreen } from "@/shared/kloud.screen";
import { clearToken } from "@/app/setting/clear.token.action";
import { deleteUserAction } from "@/app/setting/sign.out.action";
import { DialogInfo } from "@/app/setting/setting.menu.item";

const reasons = [
  "원하는 콘텐츠가 부족해요.",
  "앱을 자주 사용하지 않아요.",
  "이용 중 오류가 자주 발생해요.",
  "새 계정을 만들고 싶어요.",
  "기타",
];

export default function SignOutForm() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState("");

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    if (reason !== "기타") {
      setOtherReason(""); // 기타 선택 해제 시 입력 필드 초기화
    }
  };

  const onClickBack = () => {
    window.KloudEvent?.back()
  }

  const onClickSignOut = () => {
    const dialogInfo = {
      id: 'SignOut',
      type: 'YESORNO',
      title: '회원탈퇴',
      message: "정말로 회원탈퇴 하시겠습니까?\n회원님의 데이터가 모두 삭제됩니다.",
      route: KloudScreen.Login,
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      console.log(data)
      if (data.route && data.id == 'SignOut') {
        const res = await deleteUserAction({
          reason: selectedReason ?? ''
        });
        if ('success' in res && res.success) {
          await clearToken();
          localStorage.clear();
          sessionStorage.clear();
          window.KloudEvent?.clearToken()
          window.KloudEvent?.showToast('성공적으로 회원탈퇴하였습니다.')
          window.KloudEvent.clearAndPush(data.route)
        }
      }
    }
  }, [selectedReason])

  return (
    <div className="flex flex-col p-6 bg-white rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-black">정말 탈퇴하시겠어요? 😢</h2>
      <p className="text-gray-500 mt-2">
        회원님이 떠나신다니 너무 아쉬워요.
        탈퇴하시면 계정 정보와 활동 내역이 삭제되며, 한 달 이전에는 복구가 가능해요.
      </p>

      <h3 className="font-bold mt-6 text-[16px] text-black">탈퇴하시려는 이유가 무엇인지 궁금해요.</h3>

      <div className="mt-4 space-y-2">
        {reasons.map((reason) => (
          <label
            key={reason}
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 text-gray-800 ${
              selectedReason === reason ? 'border-2 border-black' : ''
            }`}
            onClick={() => handleReasonSelect(reason)}
          >
            <input
              type="radio"
              name="reason"
              className="hidden"
              checked={selectedReason === reason}
              onChange={() => handleReasonSelect(reason)}
            />
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-all duration-200 ${
                selectedReason === reason ? "bg-black border-black" : "bg-[#22222233] border-white"
              }`}
            >
              {selectedReason === reason && (
                <CheckIcon/>
              )}
            </div>
            <span className="ml-4 text-[14px] text-[#222222]">{reason}</span>
          </label>
        ))}
      </div>

      {selectedReason === "기타" && (
        <textarea
          className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-[14px] text-black touch-action-manipulation"
          style={{touchAction: "manipulation"}}
          placeholder="어떤 점이 불편하셨나요? 더 좋은 서비스가 될 수 있도록 의견을 남겨주세요!"
          value={otherReason}
          onChange={(e) => setOtherReason(e.target.value)}
        />
      )}

      <div className="flex justify-between gap-3 mt-6">
        <button
          onClick={onClickBack}
          className="flex-1 py-3 px-5 border border-gray-400 rounded-lg text-gray-700
               active:scale-[0.98] active:bg-gray-100 transition-all duration-150"
        >
          계속 이용하기
        </button>
        <button
          onClick={onClickSignOut}
          className="flex-1 py-3 px-5 bg-black text-white rounded-lg
               active:scale-[0.98] active:bg-gray-900 transition-all duration-150"
        >
          네, 탈퇴할게요
        </button>
      </div>
    </div>
  );
}