'use client'
import { FormEvent, useState } from "react";
import {
  authenticateDeveloperAction
} from "@/app/profile/setting/developer/authentication/authenticate.developer.action";
import { KloudScreen } from "@/shared/kloud.screen";
import CloseIcon from "../../../../../../public/assets/ic_close.svg";
import { kloudNav } from "@/app/lib/kloudNav";

type Mode = 'select' | 'developer' | 'kiosk';

export const DeveloperAuthenticationForm = ({os} : {os: string}) => {
  const [mode, setMode] = useState<Mode>('select');
  const [password, setPassword] = useState('');
  const [kioskStudioId, setKioskStudioId] = useState('');

  const handleDeveloperSubmit = async (e: FormEvent) => {
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

  const handleKioskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (kioskStudioId.trim()) {
      kloudNav.clearAndPush(`${KloudScreen.Kiosk}?studioId=${kioskStudioId.trim()}`);
    }
  };

  return (
    <div className="flex flex-col p-4 h-full">
      {/* 헤더 */}
      <div className="w-full flex flex-row justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-black">
          {mode === 'select' ? '모드 선택' : mode === 'developer' ? '개발자 모드' : '키오스크 모드'}
        </h2>
        <div className="flex items-center gap-2">
          {mode !== 'select' && (
            <button
              onClick={() => { setMode('select'); setPassword(''); setKioskStudioId(''); }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button
            onClick={() => window.KloudEvent.closeBottomSheet()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon className="w-5 h-5"/>
          </button>
        </div>
      </div>

      {/* 모드 선택 */}
      {mode === 'select' && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setMode('developer')}
            className="flex items-center gap-4 px-5 py-5 rounded-2xl border-2 border-gray-100 bg-white active:scale-[0.98] active:border-black transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16 18L22 12L16 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6L2 12L8 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[16px] font-bold text-black">개발자 모드</span>
              <span className="text-[13px] text-[#86898C]">서버 환경 변경</span>
            </div>
          </button>

          <button
            onClick={() => setMode('kiosk')}
            className="flex items-center gap-4 px-5 py-5 rounded-2xl border-2 border-gray-100 bg-white active:scale-[0.98] active:border-black transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#1E2124] flex items-center justify-center flex-shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="16" rx="2" stroke="white" strokeWidth="1.8"/>
                <path d="M4 12H20" stroke="white" strokeWidth="1.8"/>
                <path d="M12 18V22" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M8 22H16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[16px] font-bold text-black">키오스크 모드</span>
              <span className="text-[13px] text-[#86898C]">스튜디오 키오스크 진입</span>
            </div>
          </button>
        </div>
      )}

      {/* 개발자 모드 — 비밀번호 입력 */}
      {mode === 'developer' && (
        <form onSubmit={handleDeveloperSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="개발자 모드 활성을 위해 비밀번호를 입력하세요"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg font-medium transition-all duration-150 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98]"
            disabled={!password}
          >
            확인
          </button>
        </form>
      )}

      {/* 키오스크 모드 — Studio ID 입력 */}
      {mode === 'kiosk' && (
        <form onSubmit={handleKioskSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            value={kioskStudioId}
            onChange={(e) => setKioskStudioId(e.target.value)}
            placeholder="Studio ID를 입력하세요"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-black focus:outline-none focus:border-black transition-colors"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#1E2124] text-white rounded-lg font-medium transition-all duration-150 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.98]"
            disabled={!kioskStudioId.trim()}
          >
            키오스크 진입
          </button>
        </form>
      )}
    </div>
  );
}
