'use client'

import Image from "next/image";
import React, { useEffect } from "react";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { kloudNav } from "@/app/lib/kloudNav";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";

export const ProfileEditForm = ({
                                  user,
                                  nickNameText,
                                  confirmText,
                                }: {
  user: GetUserResponse;
  nickNameText: string;
  confirmText: string;
}) => {
  const [nickName, setNickName] = React.useState<string>(user.nickName ?? "");

  const onClick = async () => {
    const res = await updateUserAction({ nickName });
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
    <div className="flex flex-col h-full px-6 py-6">
      {/* 프로필 + 닉네임 입력 영역 */}
      <div className="flex flex-row items-center space-x-4 mb-8">
        {/* 프로필 이미지 */}
        <div className="w-[64px] h-[64px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={user.profileImageUrl || "/images/default-avatar.png"}
            alt="user profile"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 닉네임 입력 */}
        <div className="flex flex-col w-full">
          <label className="text-sm font-medium text-gray-700 mb-2">
            {nickNameText}
          </label>
          <input
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
            maxLength={10}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg
                       text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/80
                       placeholder:text-gray-400 transition"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {nickName.length}/10
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="mt-auto pt-4">
        <AsyncCommonSubmitButton
          onClick={onClick}
          disabled={nickName.length === 0 || nickName === user.nickName}
        >
          {confirmText}
        </AsyncCommonSubmitButton>
      </div>
    </div>
  );
};
