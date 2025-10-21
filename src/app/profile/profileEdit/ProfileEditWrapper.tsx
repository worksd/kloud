'use client'
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { ProfileEditForm } from "@/app/onboarding/ProfileEditForm";
import React, { useEffect, useState } from "react";
import { CommonSubmitButton } from "@/app/components/buttons";
import { useLocale } from "@/hooks/useLocale";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { translate } from "@/utils/translate";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { checkDuplicateNickName } from "@/app/onboarding/action/check.duplicate.nickname.action";
import AsyncCommonSubmitButton from "@/app/components/buttons/AsyncCommonSubmitButton";
import { kloudNav } from "@/app/lib/kloudNav";

export const ProfileEditWrapper = ({user}: { user: GetUserResponse }) => {

  const [nickName, setNickName] = React.useState<string | undefined>(user.nickName);
  const {t} = useLocale()
  const onNickNameChanged = (nickName: string) => {
    setNickName(nickName)
  }
  const [inputErrorMessage, setInputErrorMessage] = useState<string | null>(null);

  const onClick = async () => {
    const duplicateRes = await checkDuplicateNickName({nickName: nickName ?? ''})
    if ('success' in duplicateRes) {
      if (duplicateRes.success) {
        const res = await updateUserAction({nickName})
        if (res.success) {
          const dialog = await createDialog({id: 'Simple', title: await translate('edit_profile_complete')})
          window.KloudEvent.showDialog(JSON.stringify(dialog))
        }
      } else {
        setInputErrorMessage(t('duplicate_nick_name_message'))
      }
    }

  }

  useEffect(() => {
    window.onDialogConfirm = async (dialogInfo: DialogInfo) => {
      if (dialogInfo.id == 'Simple') {
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: '',
        });
        kloudNav.navigateMain(bootInfo);
      }
    }
  }, []);

  return (
    <div>
      <ProfileEditForm
        isOnboarding={false}
        nickName={nickName || ''}
        profileImageUrl={user?.profileImageUrl ?? ''}
        inputErrorMessage={inputErrorMessage}
        onNickNameChanged={onNickNameChanged}
      />

      <div className="fixed bottom-4 left-0 right-0 px-6">
        <AsyncCommonSubmitButton
          onClick={onClick}
          disabled={nickName?.length == 0 || nickName == user.nickName}
        >
          {t('confirm')}
        </AsyncCommonSubmitButton>
      </div>

    </div>

  )
}