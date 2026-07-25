'use client';

import React, { useEffect, useRef, useState } from 'react';
import emailLoginAction from '@/app/login/action/email.login.action';

type Props = {
  onLoggedIn: () => void;
  onCancel: () => void;
  /** '이메일로 로그인' 제목 5연속 탭 시 호출 — 서버(엔드포인트) 변경 진입. 홈 로고 5탭과 같은 규칙. */
  onAdminMode?: () => void;
};

export const KioskOperatorEmailLogin = ({ onLoggedIn, onCancel, onAdminMode }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // 현재 웹 엔드포인트 — 이 웹을 서빙한 origin. 어느 서버에 붙어 있는지 로그인 전에 확인할 수 있게 노출.
  // (SSR/CSR 불일치를 피하려고 마운트 후에 채운다)
  const [endpoint, setEndpoint] = useState('');
  useEffect(() => { setEndpoint(window.location.origin); }, []);

  // 제목 5번 연속 탭(1.5초 안에) → 서버 변경. 홈 화면 로고 5탭과 동일한 히든 제스처.
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTitleTap = () => {
    if (!onAdminMode) return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onAdminMode();
      return;
    }
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await emailLoginAction({ email: email.trim(), password });
      if (res.success) {
        onLoggedIn();
      } else {
        setError(res.errorMessage ?? '로그인에 실패했습니다.');
      }
    } catch {
      setError('로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center px-[5%]">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[24px] w-full max-w-[480px] p-[28px] flex flex-col"
      >
        <p
          onClick={handleTitleTap}
          className="text-[#1E2124] font-bold cursor-pointer select-none"
          style={{ fontSize: 'min(2.4vh, 26px)' }}
        >
          이메일로 로그인
        </p>
        <p className="text-[#86898C] mt-[6px]" style={{ fontSize: 'min(1.4vh, 14px)' }}>
          파트너 계정 이메일과 비밀번호로 로그인하세요
        </p>

        {/* 현재 접속 중인 웹 엔드포인트 — 어느 서버에 붙어 있는지 확인용 */}
        {endpoint && (
          <div
            className="mt-[12px] px-[12px] py-[8px] rounded-[10px] bg-[#F7F8F9] border border-[#EEF0F2] flex items-center"
            style={{ gap: 'min(0.8vh, 8px)' }}
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#3CC0AF] shrink-0" />
            <span className="text-[#8A949E] shrink-0" style={{ fontSize: 'min(1.3vh, 13px)' }}>서버</span>
            <span className="text-[#1E2124] font-bold break-all" style={{ fontSize: 'min(1.3vh, 13px)' }}>{endpoint}</span>
          </div>
        )}

        <label className="mt-[20px] flex flex-col">
          <span className="text-[#86898C] font-medium mb-[6px]" style={{ fontSize: 'min(1.3vh, 13px)' }}>이메일</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            className="h-[44px] px-[14px] rounded-[12px] border border-[#E6E8EA] focus:outline-none focus:border-[#1E2124] text-[#1E2124]"
            style={{ fontSize: 'min(1.6vh, 16px)' }}
          />
        </label>

        <label className="mt-[12px] flex flex-col">
          <span className="text-[#86898C] font-medium mb-[6px]" style={{ fontSize: 'min(1.3vh, 13px)' }}>비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="h-[44px] px-[14px] rounded-[12px] border border-[#E6E8EA] focus:outline-none focus:border-[#1E2124] text-[#1E2124]"
            style={{ fontSize: 'min(1.6vh, 16px)' }}
          />
        </label>

        {error && (
          <p className="mt-[10px] text-[#E53935]" style={{ fontSize: 'min(1.3vh, 13px)' }}>{error}</p>
        )}

        <div className="mt-[24px] flex gap-[10px]">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-[48px] rounded-[12px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform disabled:opacity-50"
          >
            <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(1.6vh, 16px)' }}>취소</span>
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className={`flex-[2] h-[48px] rounded-[12px] flex items-center justify-center transition-all ${
              canSubmit ? 'bg-[#1E2124] active:scale-[0.97]' : 'bg-[#CDD1D5]'
            }`}
          >
            <span className="text-white font-bold" style={{ fontSize: 'min(1.6vh, 16px)' }}>
              {loading ? '로그인 중...' : '로그인'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
