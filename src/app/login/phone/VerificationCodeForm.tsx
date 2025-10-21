import { CommonLoginInputBox } from "@/app/components/InputBox";
import { Ref } from "react";

export const VerificationCodeForm = ({ref, value, handleChangeAction, placeholder}: {
  value: string,
  handleChangeAction: (value: string) => void,
  placeholder: string,
  ref?: Ref<HTMLInputElement>;
}) => {
  return (
    <div className={'text-black'}>
      <CommonLoginInputBox
        ref={ref}
        value={value}
        placeholder={placeholder}
        handleChangeAction={handleChangeAction}
        maxLength={6}
        inputMode={'numeric'}
      />
    </div>
  )
}