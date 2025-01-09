'use client';
import AppleLogo from "../../../public/assets/logo_apple.svg"
import { sendAppleLogin } from "@/utils/kloud.navigate";

const AppleLoginButton = () => {

  return (
    <button className="relative flex items-center justify-center bg-black text-white text-lg font-semibold rounded-lg h-14 shadow-lg w-full"
    onClick={sendAppleLogin}>
      <span className="absolute left-4">
        <AppleLogo/>
      </span>
      <span className="flex-1 text-center text-[16px]">
        Apple로 시작하기
      </span>
    </button>
  );
};

export default AppleLoginButton