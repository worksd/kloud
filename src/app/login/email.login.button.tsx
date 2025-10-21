import EmailIcon from "../../../public/assets/ic_mail.svg";
import { translate } from "@/utils/translate";

export const EmailLoginButton = async () => {
  return (
    <button
      className={`relative flex items-center justify-center bg-[#FAFAFB] text-black text-lg font-semibold 
        rounded-[16px] py-4 shadow-lg w-full
        active:scale-[0.95] transition-transform duration-150 select-none
        `}
      // onClick={appleLogin}
    >
      <span className="absolute left-4">
        <EmailIcon/>
      </span>
      <div className="flex-1 text-center text-[16px]">{await translate('continue_with_email')}</div>
    </button>
  )
}