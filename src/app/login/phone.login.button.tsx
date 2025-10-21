import PhoneIcon from "../../../public/assets/ic_phone.svg";
import { translate } from "@/utils/translate";

export const PhoneLoginButton = async () => {
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
      <div className="flex-1 text-center text-[16px]">{await translate('continue_with_phone')}</div>
    </button>
  )
}