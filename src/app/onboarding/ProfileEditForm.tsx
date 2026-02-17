'use client'

import Image from "next/image";
import React, { useEffect } from "react";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { kloudNav } from "@/app/lib/kloudNav";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import GoogleLogo from "../../../public/assets/logo_google.svg";
import AppleLogo from "../../../public/assets/logo_apple.svg";

export const ProfileEditForm = ({
                                  user,
                                  nickNameText,
                                  confirmText,
                                  accountInfoText,
                                  profileInfoText,
                                  userIdText,
                                  emailText,
                                  nameText,
                                  identityVerifiedText,
                                  identityNotVerifiedText,
                                  loginTypeText,
                                  refundAccountBankText,
                                  refundAccountNumberText,
                                  refundAccountDepositorText,
                                  refundAccountSectionText,
                                }: {
  user: GetUserResponse;
  nickNameText: string;
  confirmText: string;
  accountInfoText: string;
  profileInfoText: string;
  userIdText: string;
  emailText: string;
  nameText: string;
  identityVerifiedText: string;
  identityNotVerifiedText: string;
  loginTypeText: string;
  refundAccountBankText: string;
  refundAccountNumberText: string;
  refundAccountDepositorText: string;
  refundAccountSectionText: string;
}) => {
  const [nickName, setNickName] = React.useState<string>(user.nickName ?? "");
  const [name, setName] = React.useState<string>(user.name ?? "");
  const [refundBank, setRefundBank] = React.useState<string>(user.refundAccountBank ?? "");
  const [refundNumber, setRefundNumber] = React.useState<string>(user.refundAccountNumber ?? "");
  const [refundDepositor, setRefundDepositor] = React.useState<string>(user.refundAccountDepositor ?? "");
  const hasChanges =
    (nickName !== (user.nickName ?? "") && nickName.length > 0) ||
    (name !== (user.name ?? "")) ||
    (refundBank !== (user.refundAccountBank ?? "")) ||
    (refundNumber !== (user.refundAccountNumber ?? "")) ||
    (refundDepositor !== (user.refundAccountDepositor ?? ""));

  const onClick = async () => {
    const res = await updateUserAction({
      nickName: nickName !== (user.nickName ?? "") ? nickName : undefined,
      name: name !== (user.name ?? "") ? name : undefined,
      refundAccountBank: refundBank !== (user.refundAccountBank ?? "") ? refundBank : undefined,
      refundAccountNumber: refundNumber !== (user.refundAccountNumber ?? "") ? refundNumber : undefined,
      refundDepositor: refundDepositor !== (user.refundAccountDepositor ?? "") ? refundDepositor : undefined,
    });
    if (res.success) {
      const dialog = await createDialog({
        id: "Simple",
        title: await translate("edit_profile_complete"),
      });
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    } else if (res.errorMessage) {
      const dialog = await createDialog({
        id: "Simple",
        title: await translate("edit_profile"),
        message: res.errorMessage,
      });
      window.KloudEvent.showDialog(JSON.stringify(dialog));
    }
  };

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.title === await translate('edit_profile_complete')) {
        await kloudNav.navigateMain({});
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      {/* 계정 정보 섹션 */}
      <section className="px-6 pt-6">
        <h2 className="text-[18px] font-bold text-black mb-4">{accountInfoText}</h2>
        <div className="flex flex-col bg-[#F7F8F9] rounded-2xl divide-y divide-[#ECECEC]">
          <LoginTypeRow label={loginTypeText} loginType={user.loginType}/>
          <InfoRow label={emailText} value={user.email}/>
          <EditableRow label={nameText} value={name} onChange={setName}/>
        </div>
      </section>

      {/* 프로필 정보 섹션 */}
      <section className="px-6 pt-8">
        <h2 className="text-[18px] font-bold text-black mb-4">{profileInfoText}</h2>
        <div className="flex flex-col bg-[#F7F8F9] rounded-2xl p-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <Image
                src={user.profileImageUrl || "/images/default-avatar.png"}
                alt="user profile"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-[13px] font-medium text-[#86898C] mb-1.5">
              {nickNameText}
            </label>
            <input
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              maxLength={10}
              className="w-full px-4 py-2.5 bg-white border border-[#E0E0E0] rounded-xl
                         text-[15px] text-black focus:outline-none focus:ring-2 focus:ring-black/80
                         placeholder:text-gray-400 transition"
            />
            <div className="text-right text-[12px] text-[#AEAEAE] mt-1">
              {nickName.length}/10
            </div>
          </div>
        </div>
      </section>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-6 bg-white">
        <AsyncCommonSubmitButton
          onClick={onClick}
          disabled={!hasChanges}
        >
          {confirmText}
        </AsyncCommonSubmitButton>
      </div>
    </div>
  );
};

const loginTypeConfig: Record<string, { label: string; Logo?: React.FC<{ className?: string }> }> = {
  Kakao: { label: '카카오 로그인', Logo: KakaoLogo },
  Google: { label: 'Google 로그인', Logo: GoogleLogo },
  Apple: { label: 'Apple 로그인', Logo: AppleLogo },
  Phone: { label: '휴대폰 로그인' },
  Email: { label: '이메일 로그인' },
};

const LoginTypeRow = ({ label, loginType }: { label: string; loginType: string }) => {
  const config = loginTypeConfig[loginType] ?? { label: loginType };
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-[14px] text-[#86898C]">{label}</span>
      <div className="flex items-center gap-2">
        {config.Logo && <config.Logo className="w-5 h-5" />}
        <span className="text-[14px] text-black font-medium">{config.label}</span>
      </div>
    </div>
  );
};

const InfoRow = ({label, value}: { label: string, value: string }) => (
  <div className="flex items-center justify-between px-4 py-3.5">
    <span className="text-[14px] text-[#86898C]">{label}</span>
    <span className="text-[14px] text-black font-medium">{value}</span>
  </div>
);

const EditableRow = ({label, value, onChange, inputMode, placeholder}: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  inputMode?: 'text' | 'tel',
  placeholder?: string,
}) => (
  <div className="flex items-center justify-between px-4 py-2">
    <span className="text-[14px] text-[#86898C] flex-shrink-0">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode={inputMode ?? 'text'}
      placeholder={placeholder}
      className="text-[14px] text-black font-medium text-right bg-transparent
                 border-b border-transparent focus:border-black/30
                 focus:outline-none transition py-1.5 w-[60%]
                 placeholder:text-[#CACACA]"
    />
  </div>
);
