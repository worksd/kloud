'use client';

import React, {useState, useEffect} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import {
  searchUserByPhoneAction,
  registerKioskUserAction
} from "@/app/profile/setting/kiosk/kiosk.actions";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {KioskNameKeyboard} from "@/app/profile/setting/kiosk/KioskNameKeyboard";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";
import {COUNTRIES} from "@/app/certification/COUNTRIES";

type Step = 'phone' | 'confirm' | 'name';

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '010', '0', 'delete'];

const Keypad = ({onPress}: { onPress: (key: string) => void }) => (
    <div className="grid grid-cols-3 gap-[8px] w-full max-w-[400px]">
      {KEYPAD_KEYS.map((key, i) => (
          <button
              key={i}
              onPointerDown={(e) => {
                e.preventDefault();
                onPress(key);
              }}
              className="h-[64px] rounded-[12px] bg-gray-100 text-[24px] font-medium text-black flex items-center justify-center active:bg-gray-200 transition-colors select-none"
          >
            {key === 'delete' ? (
                <svg width="44" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H20a1 1 0 011 1v16a1 1 0 01-1 1H9l-7-9 7-9z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 9l-4 6M12 9l4 6" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            ) : key}
          </button>
      ))}
    </div>
);

type KioskPhoneFormProps = {
  studioName: string;
  onBack: () => void;
  onComplete: (userId: number, userName?: string) => void;
  locale: Locale;
};

export const KioskPhoneForm = ({studioName, onBack, onComplete, locale}: KioskPhoneFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('82');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [name, setName] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userNickName, setUserNickName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userProfileImageUrl, setUserProfileImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(180);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onBack();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onBack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const formatPhoneDisplay = (value: string) => {
    const nums = value.replace(/\D/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  const handleKeyPress = (key: string) => {
    setError(null);
    if (key === 'delete') {
      setPhone((prev) => prev.slice(0, -1));
    } else {
      setPhone((prev) => {
        const next = prev + key;
        if (next.length > 11) return prev;
        return next;
      });
    }
  };

  const handleSearch = async () => {
    if (phone.length < 10) {
      setError(t('kiosk_phone_error'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await searchUserByPhoneAction(phone, countryCode);
      if (isGuinnessErrorCase(result)) {
        setStep('name');
      } else {
        setUserId(result.id);
        setUserName(result.name || null);
        setUserNickName(result.nickName || null);
        setUserEmail(result.email || null);
        setUserPhone(result.phone || null);
        setUserProfileImageUrl(result.profileImageUrl || null);
        setStep('confirm');
      }
    } catch {
      setError(t('kiosk_search_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      setError(t('kiosk_phone_error'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await registerKioskUserAction(phone, countryCode, name.trim());
      if (isGuinnessErrorCase(result)) {
        setError(t('kiosk_register_failed'));
        setLoading(false);
        return;
      }
      setLoading(false);
      onComplete(result.id, name.trim());
    } catch {
      setError(t('kiosk_register_failed'));
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'phone':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px] w-full">
                {t('kiosk_phone_title')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[32px] w-full">
                {t('kiosk_phone_desc')}
              </p>

              <div className="relative mb-[8px]">
                <button
                    onClick={() => setShowCountryPicker((v) => !v)}
                    className="h-[48px] px-[16px] rounded-[12px] border-2 border-gray-200 flex items-center gap-[8px] text-[20px] font-medium text-black"
                >
                  <span className="text-[24px] leading-none">{COUNTRIES.find((c) => c.dial === countryCode)?.flag}</span>
                  <span>+{countryCode}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showCountryPicker && (
                    <>
                      <div className="fixed inset-0 z-[9]" onClick={() => setShowCountryPicker(false)}/>
                      <div className="absolute top-[52px] left-0 bg-white border border-gray-200 rounded-[16px] shadow-lg z-10 overflow-y-auto max-h-[400px] w-[320px]">
                        {COUNTRIES.map((c) => (
                            <button
                                key={c.key}
                                onClick={() => {
                                  setCountryCode(c.dial);
                                  setShowCountryPicker(false);
                                }}
                                className={`w-full px-[20px] py-[14px] text-[18px] text-black text-left flex items-center gap-[10px] hover:bg-gray-50 active:bg-gray-100 ${c.dial === countryCode ? 'font-bold bg-gray-50' : ''}`}
                            >
                              <span className="text-[22px] leading-none">{c.flag}</span>
                              <span className="flex-1">{c.nameKo}</span>
                              <span className="text-gray-500 font-semibold">+{c.dial}</span>
                            </button>
                        ))}
                      </div>
                    </>
                )}
              </div>

              <div className="w-full max-w-[400px] h-[72px] rounded-[16px] border-2 border-gray-200 flex items-center justify-center mb-[12px]">
                <p className="text-[32px] font-medium tracking-[2px] text-black">
                  {phone ? formatPhoneDisplay(phone) : <span className="text-gray-300">010-0000-0000</span>}
                </p>
              </div>

              {error && <p className="text-red-500 text-[16px] text-center mb-[12px]">{error}</p>}

              <Keypad onPress={handleKeyPress}/>

              <button
                  onClick={handleSearch}
                  disabled={loading || phone.length < 10}
                  className="w-full max-w-[400px] h-[64px] rounded-[16px] bg-black text-white text-[22px] font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-[16px]"
              >
                {loading ? t('kiosk_checking') : t('kiosk_confirm')}
              </button>
            </>
        );

      case 'confirm':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px] w-full">
                {t('kiosk_confirm_title')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[40px] w-full">
                {t('kiosk_confirm_desc')}
              </p>

              <div className="w-full max-w-[500px] bg-gray-50 rounded-[20px] p-[32px] flex flex-col items-center gap-[20px] mb-[32px]">
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                  {userProfileImageUrl ? (
                      <img src={userProfileImageUrl} alt="" className="w-full h-full object-cover"/>
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[32px]">
                        👤
                      </div>
                  )}
                </div>

                <div className="w-full flex flex-col gap-[12px]">
                  {userName && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">{t('kiosk_label_name')}</p>
                        <p className="text-black text-[20px] font-bold">{userName}</p>
                      </div>
                  )}
                  {userNickName && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">{t('kiosk_label_nickname')}</p>
                        <p className="text-black text-[20px] font-bold">{userNickName}</p>
                      </div>
                  )}
                  {userPhone && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">{t('kiosk_label_phone')}</p>
                        <p className="text-black text-[20px] font-bold">{formatPhoneDisplay(userPhone)}</p>
                      </div>
                  )}
                  {userEmail && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">{t('kiosk_label_email')}</p>
                        <p className="text-black text-[20px] font-bold">{userEmail}</p>
                      </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-[16px] text-center mb-[12px]">{error}</p>}

              <div className="w-full max-w-[500px] flex flex-col gap-[12px]">
                <button
                    onClick={() => {
                      if (userId) onComplete(userId, userName ?? undefined);
                    }}
                    className="w-full h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium transition-colors"
                >
                  {t('kiosk_confirm')}
                </button>
                <button
                    onClick={() => {
                      setUserId(null);
                      setUserName(null);
                      setUserNickName(null);
                      setUserEmail(null);
                      setUserPhone(null);
                      setUserProfileImageUrl(null);
                      setPhone('');
                      setError(null);
                      setStep('phone');
                    }}
                    className="w-full h-[72px] rounded-[16px] border-2 border-gray-200 text-black text-[22px] font-medium transition-colors"
                >
                  {t('kiosk_not_me')}
                </button>
              </div>
            </>
        );

      case 'name':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px] w-full">
                {t('kiosk_welcome_title')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[32px] w-full">
                {t('kiosk_welcome_desc')}
              </p>
              <KioskNameKeyboard onChange={(text) => { setName(text); setError(null); }} />
              {error && <p className="text-red-500 text-[16px] text-center mt-[12px]">{error}</p>}
              <button
                  onClick={handleNameSubmit}
                  disabled={loading || !name.trim()}
                  className="w-full max-w-[600px] h-[64px] rounded-[16px] bg-black text-white text-[22px] font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-[16px]"
              >
                {loading ? t('kiosk_processing') : t('kiosk_confirm')}
              </button>
            </>
        );
    }
  };

  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        <div className="h-[70px] px-[48px] flex items-center justify-between shrink-0 border-b border-gray-100">
          <button onClick={onBack}
                  className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
            <BackArrowIcon className="w-full h-full"/>
          </button>
          <p className="text-black text-[20px] font-bold">{t('kiosk_phone_verify')}</p>
          <p className="text-gray-500 text-[16px] tracking-[-0.48px]">
            {studioName}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] py-[40px]">
          {renderContent()}
        </div>

        <div className="px-[48px] pb-[40px] flex justify-center shrink-0 h-[60px]">
          {countdown <= 60 && (
            <p className="text-[18px] tracking-[-0.54px]">
              <span className="font-semibold text-black">{formatTime(countdown)}</span>
              <span className="text-gray-300"> {t('kiosk_countdown_suffix')}</span>
            </p>
          )}
        </div>
      </div>
  );
};
