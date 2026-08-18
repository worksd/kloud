'use client';

// PC 웹 전용 로그인 다이얼로그.
// methods → email-login / email-signup / phone-input → phone-code 단계 전환을 다이얼로그 내부에서 처리.
// 카카오는 OAuth 웹 플로우(redirect)로 빠짐.
// 모든 액션은 기존 server action 재사용 (emailLoginAction, signUpAction, sendVerificationSMS, phoneLoginAction).
// 성공 시 기본 경로(/lessons)로 풀 리로드(상단바 세션 반영). New 유저면 /onboarding으로.

import { useEffect, useState } from "react";
import KakaoLogo from "../../../public/assets/logo_kakao.svg";
import { KloudScreen } from "@/shared/kloud.screen";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import emailLoginAction from "@/app/login/action/email.login.action";
import { signUpAction } from "@/app/signUp/signup.action";
import { sendVerificationSMS } from "@/app/certification/send.message.action";
import { phoneLoginAction } from "@/app/login/phone/phoneLoginAction";
import { loginSuccessAction } from "@/app/login/action/login.success.action";
import { saveRecentLoginMethod } from "@/app/login/recentLoginMethod";
import { UserStatus } from "@/entities/user/user.status";
import { ExceptionResponseCode } from "@/app/guinnessErrorCase";
import { COUNTRIES } from "@/app/certification/COUNTRIES";

type Step = 'methods' | 'email-login' | 'email-signup' | 'phone-input' | 'phone-code';

const CACHED_EMAIL_KEY = 'kloud_cached_email';

export const WebLoginDialog = ({
  open,
  onCloseAction,
  locale,
}: {
  open: boolean;
  onCloseAction: () => void;
  locale: Locale;
}) => {
  // 단계
  const [step, setStep] = useState<Step>('methods');

  // 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countryCode, setCountryCode] = useState('KR');
  const [countryOpen, setCountryOpen] = useState(false);
  const selectedCountry = COUNTRIES.find((c) => c.key === countryCode) ?? COUNTRIES[0];

  // 액션 상태
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ESC 키
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseAction(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCloseAction]);

  // body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // 닫힐 때 상태 reset
  useEffect(() => {
    if (!open) {
      setStep('methods');
      setError('');
      setPassword('');
      setCode('');
      setPhone('');
      setLoading(false);
      setCountryOpen(false);
    } else {
      // 열릴 때 캐시된 이메일 채우기
      try {
        const cached = localStorage.getItem(CACHED_EMAIL_KEY);
        if (cached) setEmail(cached);
      } catch { /* noop */ }
    }
  }, [open]);

  if (!open) return null;

  // 로그인 성공 후 라우팅 — 풀 리로드로 방금 세팅된 세션 쿠키가 레이아웃(상단바) 포함
  // 서버 컴포넌트에 확실히 반영되게 (이메일 로그인 페이지와 동일 방식).
  // returnUrl 없이 항상 기본 경로(/lessons)로 — ?login=true 쿼리도 이 리로드로 함께 사라진다.
  const onLoginSuccess = (status?: UserStatus) => {
    if (status === UserStatus.New) {
      window.location.replace(KloudScreen.Onboard);
    } else {
      window.location.replace('/lessons');
    }
  };

  // ── 액션 ─────────────────────────────────────────────────────
  const handleKakao = () => {
    const state = encodeURIComponent('/');
    const URL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_API_KEY}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_OAUTH_REDIRECT_URL}&response_type=code&state=${state}`;
    window.location.href = URL;
  };

  const handleEmailLogin = async () => {
    setError('');
    setLoading(true);
    const res = await emailLoginAction({ email, password });
    setLoading(false);
    if ('status' in res) {
      try { localStorage.setItem(CACHED_EMAIL_KEY, email); } catch { /* noop */ }
      saveRecentLoginMethod('email');
      onLoginSuccess(res.status);
    } else {
      setError(res.errorMessage ?? '로그인에 실패했어요');
    }
  };

  const handleEmailSignup = async () => {
    setError('');
    setLoading(true);
    const res = await signUpAction({ email, password });
    setLoading(false);
    if (res.success) {
      try { localStorage.setItem(CACHED_EMAIL_KEY, email); } catch { /* noop */ }
      saveRecentLoginMethod('email');
      onLoginSuccess(res.status);
    } else {
      if (res.errorCode === ExceptionResponseCode.EMAIL_ALREADY_EXISTS) {
        setError('이미 가입된 이메일이에요');
      } else {
        setError(res.errorMessage ?? '회원가입에 실패했어요');
      }
    }
  };

  const handleSendSMS = async () => {
    setError('');
    setLoading(true);
    const res = await sendVerificationSMS({ phone, countryCode });
    setLoading(false);
    if ('ttl' in res) {
      setCode('');
      setStep('phone-code');
    } else if ('message' in res) {
      setError(res.message ?? '코드 전송에 실패했어요');
    }
  };

  const handlePhoneLogin = async () => {
    setError('');
    setLoading(true);
    const res = await phoneLoginAction({ code, phone, countryCode });
    setLoading(false);
    if ('accessToken' in res && res.accessToken) {
      saveRecentLoginMethod('phone');
      await loginSuccessAction({ accessToken: res.accessToken, userId: res.user.id });
      onLoginSuccess(res.user.status);
    } else {
      setError('인증 코드가 일치하지 않아요');
    }
  };

  // ── UI 헬퍼 ─────────────────────────────────────────────────
  const inputCls = 'w-full bg-transparent p-4 text-[15px] font-medium text-black placeholder:text-gray-400 outline-none';
  const inputBoxCls = 'rounded-xl ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-black transition';
  const primaryBtnCls = (disabled: boolean) =>
    `w-full h-12 rounded-xl text-[15px] font-semibold transition ${
      disabled ? 'bg-[#BCBFC2] text-white cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
    }`;

  const emailValid = email.trim() !== '' && password.trim() !== '';
  const emailSignupValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 8;

  const goBack = () => {
    setError('');
    if (step === 'phone-code') setStep('phone-input');
    else setStep('methods');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center"
    >
      {/* backdrop */}
      <button
        aria-label="닫기"
        onClick={onCloseAction}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* dialog panel */}
      {/* overflow-hidden이면 국가코드 드롭다운이 패널 밖에서 잘린다 — 라운드는 유지되므로 클리핑 해제 */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl">

        {/* header: back + close */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {step !== 'methods' ? (
            <button
              aria-label="뒤로"
              onClick={goBack}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f5f6f8] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : <span/>}
          <button
            aria-label="닫기"
            onClick={onCloseAction}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f5f6f8] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 3L15 15M15 3L3 15" stroke="#505356" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="px-8 pt-12 pb-8 flex flex-col items-center">
          {/* 로고 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo_black.svg" alt="rawgraphy" style={{ height: 18, width: 'auto' }}/>

          {/* methods */}
          {step === 'methods' && (
            <>
              <p className="text-[14px] text-[#86898C] mt-3">{getLocaleString({locale, key: 'do_start'})}</p>

              <div className="w-full mt-8 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleKakao}
                  className="relative flex items-center justify-center bg-[#FEE500] text-black text-[15px] font-semibold rounded-[14px] py-3.5 w-full hover:brightness-95 transition-all"
                >
                  <span className="absolute left-4"><KakaoLogo/></span>
                  <span>{getLocaleString({locale, key: 'continue_with_kakao'})}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setError(''); setStep('phone-input'); }}
                  className="relative flex items-center justify-center bg-white text-black text-[15px] font-semibold rounded-[14px] py-3.5 w-full border border-[#dcdee0] hover:border-black transition-colors"
                >
                  <svg className="absolute left-4" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{getLocaleString({locale, key: 'continue_with_phone'})}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setError(''); setStep('email-login'); }}
                  className="relative flex items-center justify-center bg-white text-black text-[15px] font-semibold rounded-[14px] py-3.5 w-full border border-[#dcdee0] hover:border-black transition-colors"
                >
                  <svg className="absolute left-4" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="#1a1a1a" strokeWidth="1.6"/>
                    <path d="M3 7l9 6 9-6" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                  <span>{getLocaleString({locale, key: 'continue_with_email'})}</span>
                </button>
              </div>
            </>
          )}

          {/* email login */}
          {step === 'email-login' && (
            <>
              <h2 className="text-[18px] font-bold text-black mt-4">이메일로 로그인</h2>

              <form
                className="w-full mt-6 flex flex-col gap-3"
                onSubmit={(e) => { e.preventDefault(); if (emailValid && !loading) handleEmailLogin(); }}
              >
                <div className={inputBoxCls}>
                  <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                <div className={`relative ${inputBoxCls}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#666] hover:text-black"
                  >
                    {showPassword ? '숨기기' : '보기'}
                  </button>
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={!emailValid || loading}
                  className={primaryBtnCls(!emailValid || loading)}
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>
              </form>

              <div className="mt-5 text-[13px] text-[#666]">
                {getLocaleString({locale, key: 'not_member_sign_up'})}{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setPassword(''); setStep('email-signup'); }}
                  className="font-semibold text-black hover:underline"
                >
                  {getLocaleString({locale, key: 'create_account'})}
                </button>
              </div>
            </>
          )}

          {/* email signup */}
          {step === 'email-signup' && (
            <>
              <h2 className="text-[18px] font-bold text-black mt-4">{getLocaleString({locale, key: 'sign_up'})}</h2>

              <form
                className="w-full mt-6 flex flex-col gap-3"
                onSubmit={(e) => { e.preventDefault(); if (emailSignupValid && !loading) handleEmailSignup(); }}
              >
                <div className={inputBoxCls}>
                  <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    autoComplete="email"
                    className={inputCls}
                  />
                </div>

                <div className={`relative ${inputBoxCls}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="비밀번호 (8자 이상)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#666] hover:text-black"
                  >
                    {showPassword ? '숨기기' : '보기'}
                  </button>
                </div>

                <p className="text-[11px] text-[#86898C] leading-relaxed">
                  • {getLocaleString({locale, key: 'password_min_length'})}<br/>
                  • {getLocaleString({locale, key: 'password_requirements'})}
                </p>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={!emailSignupValid || loading}
                  className={primaryBtnCls(!emailSignupValid || loading)}
                >
                  {loading ? '가입 중...' : getLocaleString({locale, key: 'sign_up'})}
                </button>
              </form>

              <div className="mt-5 text-[13px] text-[#666]">
                이미 회원이신가요?{' '}
                <button
                  type="button"
                  onClick={() => { setError(''); setPassword(''); setStep('email-login'); }}
                  className="font-semibold text-black hover:underline"
                >
                  로그인
                </button>
              </div>
            </>
          )}

          {/* phone input */}
          {step === 'phone-input' && (
            <>
              <h2 className="text-[18px] font-bold text-black mt-4">전화번호로 시작</h2>
              <p className="text-[13px] text-[#86898C] mt-2 text-center leading-relaxed">
                {getLocaleString({locale, key: 'phone_login_message'})}
              </p>

              <form
                className="w-full mt-6 flex flex-col gap-3"
                onSubmit={(e) => { e.preventDefault(); if (phone.length >= 8 && !loading) handleSendSMS(); }}
              >
                <div className={`flex items-center gap-2`}>
                  {/* 국가코드 선택 — PC라 바텀시트 대신 드롭다운 */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCountryOpen((v) => !v)}
                      className="px-3 py-3 rounded-xl ring-1 ring-gray-200 bg-[#F5F6F8] text-[14px] font-medium text-black flex items-center gap-1.5 hover:ring-gray-300 transition"
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span>+{selectedCountry.dial}</span>
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                        <path d="M6 9l6 6 6-6" stroke="#6d7882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {countryOpen && (
                      <>
                        {/* 바깥 클릭 닫기용 투명 오버레이 */}
                        <div className="fixed inset-0 z-10" onClick={() => setCountryOpen(false)} aria-hidden/>
                        <div className="absolute left-0 top-[calc(100%+6px)] z-20 w-[260px] max-h-64 overflow-y-auto bg-white rounded-xl ring-1 ring-gray-200 shadow-lg py-1">
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.key}
                              type="button"
                              onClick={() => { setCountryCode(c.key); setCountryOpen(false); }}
                              className={`w-full px-3.5 py-2.5 text-left hover:bg-gray-50 flex items-center gap-2 ${c.key === countryCode ? 'bg-gray-50' : ''}`}
                            >
                              <span className="text-lg leading-none">{c.flag}</span>
                              <span className="text-[13px] text-gray-900 truncate">{locale === 'ko' ? c.nameKo : c.nameEn}</span>
                              <span className="ml-auto text-[13px] font-semibold text-gray-600 shrink-0">+{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`flex-1 ${inputBoxCls}`}>
                    <input
                      type="tel"
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      autoFocus
                      autoComplete="tel"
                      className={inputCls}
                    />
                  </div>
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={phone.length < 8 || loading}
                  className={primaryBtnCls(phone.length < 8 || loading)}
                >
                  {loading ? '전송 중...' : '인증코드 받기'}
                </button>
              </form>
            </>
          )}

          {/* phone code */}
          {step === 'phone-code' && (
            <>
              <h2 className="text-[18px] font-bold text-black mt-4">{getLocaleString({locale, key: 'certification_code'})}</h2>
              <p className="text-[13px] text-[#86898C] mt-2">
                +{selectedCountry.dial} {phone} 로 전송됨
              </p>

              <form
                className="w-full mt-6 flex flex-col gap-3"
                onSubmit={(e) => { e.preventDefault(); if (code.length === 6 && !loading) handlePhoneLogin(); }}
              >
                <div className={inputBoxCls}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6자리 인증 코드"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    autoFocus
                    maxLength={6}
                    className={`${inputCls} tracking-widest text-center`}
                  />
                </div>

                {error && <p className="text-[12px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={code.length !== 6 || loading}
                  className={primaryBtnCls(code.length !== 6 || loading)}
                >
                  {loading ? '확인 중...' : '확인'}
                </button>

                <button
                  type="button"
                  onClick={handleSendSMS}
                  disabled={loading}
                  className="text-[13px] text-[#86898C] hover:text-black mt-1"
                >
                  {getLocaleString({locale, key: 'resend_code'})}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
