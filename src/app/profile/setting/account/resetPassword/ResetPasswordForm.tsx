'use client'
import { getTranslatedText, TranslatableText } from "@/utils/TranslatableText";
import HidePasswordIcon from "../../../../../../public/assets/hide-password.svg";
import ShowPasswordIcon from "../../../../../../public/assets/show-password.svg";
import React, { useEffect, useState } from "react";
import { useLocale } from "@/hooks/useLocale";
import { CommonSubmitButton } from "@/app/components/buttons";
import emailLoginAction from "@/app/login/action/email.login.action";
import { GetUserResponse } from "@/app/endpoint/user.endpoint";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import CheckIcon from "../../../../../../public/assets/check.svg";
import { updateUserAction } from "@/app/onboarding/update.user.action";
import { createDialog, DialogInfo } from "@/utils/dialog.factory";
import { getBottomMenuList } from "@/utils/bottom.menu.fetch.action";
import { checkPassword } from "@/app/profile/setting/account/resetPassword/compare.password.action";
import { translate } from "@/utils/translate";

type ResetPasswordPage = 'current' | 'new'

export const ResetPasswordForm = () => {

  const [page, setPage] = useState<ResetPasswordPage>('current');
  const [oldPassword, setOldPassword] = React.useState<string>('');
  const [oldPasswordErrorMessage, setOldPasswordErrorMessage] = useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [newPassword, setNewPassword] = React.useState('');
  const [newConfirmPassword, setNewConfirmPassword] = React.useState('');
  const [isPasswordPatternValid, setIsPasswordPatternValid] = useState(false);
  const [isPasswordLengthValid, setIsPasswordLengthValid] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {t} = useLocale();

  const onOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOldPassword(e.target.value);
    setOldPasswordErrorMessage('');
  }

  const onNewPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~․!@#$%^&*()_\-+=\[\]|\\;:'"<>,.\/?])[A-Za-z\d~․!@#$%^&*()_\-+=\[\]|\\;:'"<>,.\/?]+$/;
    setIsPasswordPatternValid(passwordPattern.test(e.target.value));
    setIsPasswordLengthValid(e.target.value.length >= 8);
  }

  const onConfirmPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewConfirmPassword(e.target.value);
  }

  const onClick = async () => {
    if (page == 'current') {
      const res = await checkPassword({password: oldPassword})
      if ('success' in res) {
        setPage('new')
      } else if (res.code === ExceptionResponseCode.USER_PASSWORD_NOT_MATCH) {
        setOldPasswordErrorMessage(res.message ?? '');
      }
    } else if (page == 'new') {
      setIsSubmitting(true);
      const res = await updateUserAction({
        password: newPassword,
      })
      setIsSubmitting(false);
      if (res.success) {
        const dialog = await createDialog('Simple', await translate('password_reset_complete'))
        window.KloudEvent.showDialog(JSON.stringify(dialog))
      } else {
        const dialog = await createDialog('Simple', '알 수 없는 에러가 발생했습니다')
        window.KloudEvent.showDialog(JSON.stringify(dialog))
      }
    }
  }

  useEffect(() => {
    window.onDialogConfirm = async (data: DialogInfo) => {
      if (data.id == 'Simple') {
        const bottomMenuList = await getBottomMenuList();
        const bootInfo = JSON.stringify({
          bottomMenuList: bottomMenuList,
          route: '',
        });
        window.KloudEvent?.navigateMain(bootInfo);
      }
    }
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={'flex flex-col'}>

      {page == 'current' &&
        <div className="relative mb-2">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-[14px] font-normal text-black"><TranslatableText
              titleResource={'current_password'}/></label>
          </div>
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-[8px] focus-within:border-black">
              <input
                className="w-full text-[14px] font-medium text-black outline-none px-4 py-3 rounded-[8px] bg-white"
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={oldPassword}
                onChange={onOldPasswordChange}
                placeholder={getTranslatedText({
                  titleResource: 'input_password_message',
                  text: t('input_password_message'),
                  mounted: mounted
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4"
              >
                {showPassword ? <HidePasswordIcon/> : <ShowPasswordIcon/>}
              </button>
            </div>
          </div>
          <div className="text-[#E55B5B] text-[12px] mt-2">
            {oldPasswordErrorMessage}
          </div>
        </div>
      }

      {page == 'new' &&
        <div>
          <div className="flex items-center gap-1 mb-2">
            <label className="text-[14px] font-medium text-black" htmlFor="password"><TranslatableText
              titleResource={'new_password'}/></label>
            <span className="text-[10px] font-normal text-[#E55B5B]"><TranslatableText
              titleResource={'required'}/></span>
          </div>
          <div className="relative mb-2">
            <input
              className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={newPassword}
              onChange={onNewPasswordChanged}
              placeholder={getTranslatedText({
                titleResource: 'input_password_message',
                text: t('input_password_message'),
                mounted: mounted
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <HidePasswordIcon/> : <ShowPasswordIcon/>}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isPasswordLengthValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isPasswordLengthValid ? "text-black" : "text-gray-300"}`}>
              <TranslatableText titleResource={'password_min_length'}/>
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <CheckIcon className={`${isPasswordPatternValid ? "stroke-black" : "stroke-gray-300"}`}/>
            <span className={`text-[12px] ${isPasswordPatternValid ? "text-black" : "text-gray-300"}`}>
              <TranslatableText titleResource={'password_requirements'}/>
            </span>
          </div>

          <div className="flex items-center gap-1 mb-2 mt-5">
            <label className="text-[14px] font-medium text-black" htmlFor="password"><TranslatableText
              titleResource={'confirm_password'}/></label>
            <span className="text-[10px] font-normal text-[#E55B5B]"><TranslatableText
              titleResource={'required'}/></span>
          </div>
          <div className="relative mb-2">
            <input
              className="w-full text-[14px] font-medium text-black border border-gray-300 focus:border-black focus:outline-none rounded-md p-4"
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={newConfirmPassword}
              onChange={onConfirmPasswordChanged}
              placeholder={getTranslatedText({
                titleResource: 'input_password_message',
                text: t('input_password_message'),
                mounted: mounted
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2"
            >
              {showPassword ? <HidePasswordIcon/> : <ShowPasswordIcon/>}
            </button>
          </div>
        </div>

      }

      <div className="fixed bottom-4 left-0 right-0 px-6">
        <CommonSubmitButton
          originProps={{onClick}}
          disabled={
            page === 'current'
              ? oldPassword.length <= 0
              : newConfirmPassword.length <= 0 ||
              newConfirmPassword !== newPassword ||
              !isPasswordLengthValid ||
              !isPasswordPatternValid
          }
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
          ) : page === 'current' ? (
            t('next')
          ) : (
            t('confirm')
          )}
        </CommonSubmitButton>
      </div>


    </div>
  )
}