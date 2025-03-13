'use client'

import { useEffect, useState } from "react";
import CheckIcon from "../../../../../public/assets/check_white.svg"
import { KloudScreen } from "@/shared/kloud.screen";
import { clearCookies } from "@/app/setting/clear.token.action";
import { deleteUserAction } from "@/app/setting/sign.out.action";
import { DialogInfo } from "@/app/setting/setting.menu.item";
import { unregisterDeviceAction } from "@/app/home/action/unregister.device.action";
import { useLocale } from "@/hooks/useLocale";
import { StringResource, StringResourceKey } from "@/shared/StringResource";

const reasons: StringResourceKey[] = [
  "sign_out_reason_no_contents",
  "sign_out_reason_no_use",
  "sign_out_reason_error",
  "sign_out_reason_new_account",
  "guitar",
];

export default function SignOutForm() {
  const { t } = useLocale();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState("");

  const handleReasonSelect = (reason: StringResourceKey) => {
    setSelectedReason(reason);
    if (reason !== "guitar") {
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
      title: t('sign_out'),
      message: t('sign_out_dialog_message'),
      route: KloudScreen.Login,
    }
    window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.route && data.id == 'SignOut') {
        const res = await deleteUserAction({
          reason: selectedReason ?? ''
        });
        if ('success' in res && res.success) {
          await unregisterDeviceAction()
          await clearCookies();
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
      <h2 className="text-xl font-bold text-black">{t("sign_out_title")}</h2>
      <p className="text-gray-500 mt-2">
        {t("sign_out_description")}
      </p>

      <h3 className="font-bold mt-6 text-[16px] text-black">{t('sign_out_reason_question')}</h3>

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
            <span className="ml-4 text-[14px] text-[#222222]">{t(reason)}</span>
          </label>
        ))}
      </div>

      {selectedReason === "guitar" && (
        <textarea
          className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black text-[14px] text-black touch-action-manipulation"
          style={{touchAction: "manipulation"}}
          placeholder={t('sign_out_reason_placeholder')}
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
          {t('continue_use')}
        </button>
        <button
          onClick={onClickSignOut}
          className="flex-1 py-3 px-5 bg-black text-white rounded-lg
               active:scale-[0.98] active:bg-gray-900 transition-all duration-150"
        >
          {t('do_sign_out')}
        </button>
      </div>
    </div>
  );
}