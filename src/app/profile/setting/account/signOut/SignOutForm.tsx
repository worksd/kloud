'use client'

import { useEffect, useState } from "react";
import CheckIcon from "../../../../../../public/assets/check_white.svg"
import { clearCookies } from "@/app/profile/clear.token.action";
import { deleteUserAction } from "@/app/profile/sign.out.action";
import { unregisterDeviceAction } from "@/app/home/action/unregister.device.action";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { kloudNav } from "@/app/lib/kloudNav";
import { getLocaleString } from "@/app/components/locale";
import { safeLocalStorage, safeSessionStorage } from "@/utils/safe.storage";

const reasons: StringResourceKey[] = [
  "sign_out_reason_no_contents",
  "sign_out_reason_no_use",
  "sign_out_reason_error",
  "sign_out_reason_new_account",
  "guitar",
];

// 탈퇴 실패 안내 — 서버 메시지 우선, 없으면 공용 문구 (effect 의존성에 안 잡히게 컴포넌트 밖에 둠)
const showErrorDialog = async (locale: Locale, message?: string) => {
  const dialog = await createDialog({
    id: 'Simple',
    message: message || getLocaleString({locale, key: 'unknown_error_message'}),
  })
  window.KloudEvent?.showDialog(JSON.stringify(dialog));
}

export default function SignOutForm({locale}: { locale: Locale }) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState("");

  const handleReasonSelect = (reason: StringResourceKey) => {
    setSelectedReason(reason);
    if (reason !== "guitar") {
      setOtherReason(""); // 기타 선택 해제 시 입력 필드 초기화
    }
  };

  const onClickBack = () => {
    kloudNav.back()
  }

  const onClickSignOut = async () => {
    const dialogInfo = await createDialog({id: 'SignOut'})
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.route && data.id == 'SignOut') {
        let res: Awaited<ReturnType<typeof deleteUserAction>>;
        try {
          res = await deleteUserAction({
            reason: selectedReason ?? ''
          });
        } catch {
          await showErrorDialog(locale);
          return;
        }
        if ('success' in res && res.success) {
          await unregisterDeviceAction()
          await clearCookies();
          safeLocalStorage.clear();
          safeSessionStorage.clear();
          window.KloudEvent?.clearToken()
          window.KloudEvent?.showToast('성공적으로 회원탈퇴하였습니다.')
          kloudNav.clearAndPush(data.route)
        } else {
          await showErrorDialog(locale, 'message' in res ? res.message : undefined);
        }
      }
    }
  }, [selectedReason, locale])

  return (
    <div className="flex flex-col p-6 bg-white rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold text-black">{getLocaleString({locale, key: 'sign_out_title'})}</h2>
      <p className="text-gray-500 mt-2">
        {getLocaleString({locale, key: "sign_out_description"})}
      </p>

      <h3 className="font-bold mt-6 text-[16px] text-black">{getLocaleString({
        locale,
        key: 'sign_out_reason_question'
      })}</h3>

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
            <span className="ml-4 text-[14px] text-[#222222]">{getLocaleString({locale, key: reason})}</span>
          </label>
        ))}
      </div>

      {selectedReason === "guitar" && (
        <textarea
          className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-[14px] text-black touch-action-manipulation"
          style={{touchAction: "manipulation"}}
          placeholder={getLocaleString({locale, key: 'sign_out_reason_placeholder'})}
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
          {getLocaleString({locale, key: 'continue_use'})}
        </button>
        <button
          onClick={onClickSignOut}
          className="flex-1 py-3 px-5 bg-black text-white rounded-lg
               active:scale-[0.98] active:bg-gray-900 transition-all duration-150"
        >
          {getLocaleString({locale, key: 'do_sign_out'})}
        </button>
      </div>
    </div>
  );
}