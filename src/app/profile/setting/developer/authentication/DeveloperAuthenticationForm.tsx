'use client'
import { FormEvent, useState } from "react";
import {
  authenticateDeveloperAction
} from "@/app/profile/setting/developer/authentication/authenticate.developer.action";
import { KloudScreen } from "@/shared/kloud.screen";
import CloseIcon from "../../../../../../public/assets/ic_close.svg";
import { kloudNav } from "@/app/lib/kloudNav";

export const DeveloperAuthenticationForm = ({os} : {os: string}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (await authenticateDeveloperAction({password})) {
      setPassword('')
      if (os === 'Android') {
        kloudNav.push(KloudScreen.DeveloperSetting)
        window.KloudEvent.closeBottomSheet()
      } else if (os === 'iOS') {
        kloudNav.push(KloudScreen.DeveloperSetting)
      }
    }
  };

  return (
    <div className="flex flex-col p-4 h-full">
      {/* 헤더 */}
      <div className="w-full flex flex-row justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-black">개발자 모드</h2>
        <button
          onClick={() => window.KloudEvent.closeBottomSheet()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <CloseIcon className="w-5 h-5"/>
        </button>
      </div>

      {/* 비밀번호 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="개발자 모드 활성을 위해 비밀번호를 입력하세요"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white rounded-lg font-medium
                     transition-all duration-150
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     active:scale-[0.98]"
          disabled={!password}
        >
          확인
        </button>
      </form>
    </div>
  );
}