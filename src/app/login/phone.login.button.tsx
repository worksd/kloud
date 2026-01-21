'use client'
import PhoneIcon from "../../../public/assets/ic_phone.svg";
import { RecentLoginTooltip } from "@/app/login/RecentLoginTooltip";

type PhoneLoginButtonProps = {
  title: string;
  isRecentLogin?: boolean;
  recentLoginText?: string;
}

export const PhoneLoginButton = ({ title, isRecentLogin, recentLoginText }: PhoneLoginButtonProps) => {
  return (
    <button
      className={`relative flex items-center justify-center bg-[#FAFAFB] text-black text-lg font-semibold
        rounded-[16px] py-4 shadow-lg w-full
        active:scale-[0.95] transition-transform duration-150 select-none
        `}
    >
      <span className="absolute left-4">
        <PhoneIcon/>
      </span>
      <div className="flex-1 text-center text-[16px]">{title}</div>
      {isRecentLogin && recentLoginText && (
        <RecentLoginTooltip text={recentLoginText} />
      )}
    </button>
  )
}