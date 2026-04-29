'use client';

import React, { useState } from 'react';
import emailLoginAction from '@/app/login/action/email.login.action';

type Props = {
  onLoggedIn: () => void;
  onCancel: () => void;
};

export const KioskOperatorEmailLogin = ({ onLoggedIn, onCancel }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

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
        <p className="text-[#1E2124] font-bold" style={{ fontSize: 'min(2.4vh, 26px)' }}>
          이메일로 로그인
        </p>
        <p className="text-[#86898C] mt-[6px]" style={{ fontSize: 'min(1.4vh, 14px)' }}>
          파트너 계정 이메일과 비밀번호로 로그인하세요
        </p>

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
