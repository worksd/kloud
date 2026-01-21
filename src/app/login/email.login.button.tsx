'use client'
import EmailIcon from "../../../public/assets/ic_mail.svg";
import { RecentLoginTooltip } from "@/app/login/RecentLoginTooltip";

type EmailLoginButtonProps = {
  title: string;
  isRecentLogin?: boolean;
  recentLoginText?: string;
}

export const EmailLoginButton = ({ title, isRecentLogin, recentLoginText }: EmailLoginButtonProps) => {
  return (
    <button
      className={`relative flex items-center justify-center bg-[#FAFAFB] text-black text-lg font-semibold
        rounded-[16px] py-4 shadow-lg w-full
        active:scale-[0.95] transition-transform duration-150 select-none
        `}
    >
      <span className="absolute left-4">
        <EmailIcon/>
      </span>
      <div className="flex-1 text-center text-[16px]">{title}</div>
      {isRecentLogin && recentLoginText && (
        <RecentLoginTooltip text={recentLoginText} />
      )}
    </button>
  )
}