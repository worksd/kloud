'use client';

import React, {useState, useEffect, useCallback} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import {
  searchUserByPhoneAction,
  createStudioAttendanceAction
} from "@/app/profile/setting/kiosk/kiosk.actions";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {AttendanceStatus} from "@/app/endpoint/studio.endpoint";
import {Locale} from "@/shared/StringResource";
import {getLocaleString} from "@/app/components/locale";

type Step = 'select-status' | 'phone' | 'confirm' | 'loading' | 'complete';

const COUNTRY_CODES = [
  {code: '82', label: '🇰🇷 +82', placeholder: '010-0000-0000'},
  {code: '1', label: '🇺🇸 +1', placeholder: '000-000-0000'},
  {code: '81', label: '🇯🇵 +81', placeholder: '090-0000-0000'},
  {code: '86', label: '🇨🇳 +86', placeholder: '000-0000-0000'},
  {code: '44', label: '🇬🇧 +44', placeholder: '0000-000-0000'},
];

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

type KioskAttendanceFormProps = {
  studioName: string;
  onBack: () => void;
  onComplete: () => void;
  locale: Locale;
};

export const KioskAttendanceForm = ({studioName, onBack, onComplete, locale}: KioskAttendanceFormProps) => {
  const t = (key: Parameters<typeof getLocaleString>[0]['key']) => getLocaleString({locale, key});

  const [step, setStep] = useState<Step>('select-status');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('82');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userNickName, setUserNickName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userProfileImageUrl, setUserProfileImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [completeCountdown, setCompleteCountdown] = useState(5);

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

  useEffect(() => {
    if (step !== 'complete') return;
    setCompleteCountdown(5);
    const timer = setInterval(() => {
      setCompleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, onComplete]);

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

  const statusLabel = attendanceStatus === 'CheckIn' ? t('kiosk_check_in') : t('kiosk_check_out');
  const statusDoLabel = attendanceStatus === 'CheckIn' ? t('kiosk_check_in_do') : t('kiosk_check_out_do');
  const statusCompleteLabel = attendanceStatus === 'CheckIn' ? t('kiosk_check_in_complete') : t('kiosk_check_out_complete');

  const callAttendanceApi = useCallback(async (targetUserId: number) => {
    if (!attendanceStatus) return;
    setStep('loading');
    try {
      const result = await createStudioAttendanceAction(targetUserId, attendanceStatus);
      if (isGuinnessErrorCase(result)) {
        setError(t('kiosk_attendance_failed').replace('{0}', statusLabel));
        setStep('phone');
      } else {
        setStep('complete');
      }
    } catch {
      setError(t('kiosk_attendance_failed').replace('{0}', statusLabel));
      setStep('phone');
    }
  }, [attendanceStatus, statusLabel]);

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
        setError(t('kiosk_not_registered'));
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

  const handleBackStep = () => {
    if (step === 'phone') {
      setPhone('');
      setError(null);
      setStep('select-status');
    } else if (step === 'confirm') {
      setUserId(null);
      setUserName(null);
      setUserNickName(null);
      setUserEmail(null);
      setUserPhone(null);
      setUserProfileImageUrl(null);
      setError(null);
      setStep('phone');
    } else {
      onBack();
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'select-status':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                {t('kiosk_what_to_do')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[48px]">
                {t('kiosk_select_check')}
              </p>
              <div className="w-full max-w-[500px] flex flex-col gap-[16px]">
                <button
                    onClick={() => {
                      setAttendanceStatus('CheckIn');
                      setStep('phone');
                    }}
                    className="w-full h-[80px] rounded-[16px] bg-black text-white text-[24px] font-medium transition-colors"
                >
                  {t('kiosk_check_in')}
                </button>
                <button
                    onClick={() => {
                      setAttendanceStatus('CheckOut');
                      setStep('phone');
                    }}
                    className="w-full h-[80px] rounded-[16px] border-2 border-gray-200 text-black text-[24px] font-medium transition-colors"
                >
                  {t('kiosk_check_out')}
                </button>
              </div>
            </>
        );

      case 'phone':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                {t('kiosk_phone_title')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[32px]">
                {t('kiosk_phone_desc')}
              </p>

              <div className="relative mb-[8px]">
                <button
                    onClick={() => setShowCountryPicker((v) => !v)}
                    className="h-[48px] px-[16px] rounded-[12px] border-2 border-gray-200 flex items-center gap-[4px] text-[20px] font-medium text-black"
                >
                  {COUNTRY_CODES.find((c) => c.code === countryCode)?.label ?? `+${countryCode}`}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showCountryPicker && (
                    <div className="absolute top-[52px] left-0 bg-white border border-gray-200 rounded-[12px] shadow-lg z-10 overflow-hidden">
                      {COUNTRY_CODES.map((c) => (
                          <button
                              key={c.code}
                              onClick={() => {
                                setCountryCode(c.code);
                                setShowCountryPicker(false);
                              }}
                              className={`w-full px-[20px] py-[14px] text-[18px] text-black text-left hover:bg-gray-50 active:bg-gray-100 ${c.code === countryCode ? 'font-bold bg-gray-50' : ''}`}
                          >
                            {c.label}
                          </button>
                      ))}
                    </div>
                )}
              </div>

              <div className="w-full max-w-[400px] h-[72px] rounded-[16px] border-2 border-gray-200 flex items-center justify-center mb-[12px]">
                <p className="text-[32px] font-medium tracking-[2px] text-black">
                  {phone ? formatPhoneDisplay(phone) : <span className="text-gray-300">{COUNTRY_CODES.find(c => c.code === countryCode)?.placeholder ?? '010-0000-0000'}</span>}
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
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                {t('kiosk_confirm_title')}
              </p>
              <p className="text-gray-400 text-[20px] mb-[40px]">
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
                      if (userId) callAttendanceApi(userId);
                    }}
                    className="w-full h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium transition-colors"
                >
                  {statusDoLabel}
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

      case 'loading':
        return (
            <>
              <div className="w-[60px] h-[60px] border-4 border-gray-200 border-t-black rounded-full animate-spin mb-[32px]"/>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                {t('kiosk_attendance_processing').replace('{0}', statusLabel)}
              </p>
            </>
        );

      case 'complete':
        return (
            <>
              <div className="w-[80px] h-[80px] rounded-full bg-black flex items-center justify-center mb-[32px]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round"
                        strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                {statusCompleteLabel}
              </p>
              <p className="text-gray-400 text-[20px] mb-[48px]">
                {userName ? `${userName}${t('kiosk_name_suffix')}` : ''}{t('kiosk_attendance_complete_msg').replace('{0}', statusLabel)}
              </p>
              <button
                  onClick={onComplete}
                  className="w-full max-w-[500px] h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium transition-colors"
              >
                {t('kiosk_confirm')}
              </button>
              <p className="text-gray-400 text-[16px] mt-[20px]">
                <span className="font-semibold text-black">{completeCountdown}</span>
                <span>초 {t('kiosk_countdown_suffix')}</span>
              </p>
            </>
        );
    }
  };

  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        <div className="h-[70px] px-[48px] flex items-center justify-between shrink-0 border-b border-gray-100">
          {step !== 'complete' && step !== 'loading' ? (
              <button onClick={handleBackStep}
                      className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
                <BackArrowIcon className="w-full h-full"/>
              </button>
          ) : (
              <div className="w-[40px]"/>
          )}
          <p className="text-black text-[20px] font-bold">{t('kiosk_attendance')}</p>
          <p className="text-gray-500 text-[16px] tracking-[-0.48px]">
            {studioName}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] py-[40px]">
          {renderContent()}
        </div>

        {step !== 'complete' && (
            <div className="px-[48px] pb-[40px] flex justify-center shrink-0">
              <p className="text-[18px] tracking-[-0.54px]">
                <span className="font-semibold text-black">{formatTime(countdown)}</span>
                <span className="text-gray-300"> {t('kiosk_countdown_suffix')}</span>
              </p>
            </div>
        )}
      </div>
  );
};
