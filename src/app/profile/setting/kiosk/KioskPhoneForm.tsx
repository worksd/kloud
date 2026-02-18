'use client';

import React, {useState, useEffect, useCallback} from 'react';
import BackArrowIcon from '../../../../../public/assets/ic_back_arrow.svg';
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";
import {
  searchUserByPhoneAction,
  createKioskPaymentAction
} from "@/app/profile/setting/kiosk/kiosk.actions";
import {isGuinnessErrorCase} from "@/app/guinnessErrorCase";
import {KioskPaymentResultItem} from "@/app/endpoint/payment.record.endpoint";

type Step = 'phone' | 'confirm' | 'name' | 'loading' | 'complete';

const COUNTRY_CODES = [
  {code: '82', label: '🇰🇷 +82'},
  {code: '1', label: '🇺🇸 +1'},
  {code: '81', label: '🇯🇵 +81'},
  {code: '86', label: '🇨🇳 +86'},
  {code: '44', label: '🇬🇧 +44'},
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

type KioskPhoneFormProps = {
  studioName: string;
  lessons: GetLessonResponse[];
  onBack: () => void;
  onComplete: () => void;
};

export const KioskPhoneForm = ({studioName, lessons, onBack, onComplete}: KioskPhoneFormProps) => {
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
  const [paymentResults, setPaymentResults] = useState<KioskPaymentResultItem[]>([]);
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
    return `${mins}분 ${String(secs).padStart(2, '0')}초`;
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

  const handleNameKeyPress = (char: string) => {
    setError(null);
    if (char === 'delete') {
      setName((prev) => prev.slice(0, -1));
    } else {
      setName((prev) => prev + char);
    }
  };

  const callKioskApi = useCallback(async (targetUserId: number) => {
    setStep('loading');
    try {
      const items = lessons.map((l) => ({lessonId: l.id}));
      const result = await createKioskPaymentAction(items, targetUserId);
      if (isGuinnessErrorCase(result)) {
        setError('신청에 실패했습니다. 다시 시도해주세요.');
        setStep('phone');
      } else {
        setPaymentResults(result.lessons ?? []);
        setStep('complete');
      }
    } catch {
      setError('신청에 실패했습니다. 다시 시도해주세요.');
      setStep('phone');
    }
  }, [lessons]);

  const handleSearch = async () => {
    if (phone.length < 10) {
      setError('휴대폰 번호를 정확히 입력해주세요');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await searchUserByPhoneAction(phone, countryCode);
      if (isGuinnessErrorCase(result)) {
        setError('검색 결과가 없습니다. 번호를 확인해주세요.');
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
      setError('검색에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }
    // 신규 유저의 경우에도 phone 검색 API가 유저를 생성해주는 구조라면
    // 여기서 다시 검색하거나, 별도 생성 로직 필요
    // 현재는 TODO로 남기고 name + phone 으로 진행
    setLoading(true);
    setError(null);
    if (userId) {
      await callKioskApi(userId);
    }
    setLoading(false);
  };

  const renderContent = () => {
    switch (step) {
      case 'phone':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                휴대폰 번호를 입력해주세요
              </p>
              <p className="text-gray-400 text-[20px] mb-[32px]">
                등록된 번호로 회원 확인을 진행합니다
              </p>

              {/* 국가코드 */}
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

              {/* 번호 표시 */}
              <div className="w-full max-w-[400px] h-[72px] rounded-[16px] border-2 border-gray-200 flex items-center justify-center mb-[12px]">
                <p className="text-[32px] font-medium tracking-[2px] text-black">
                  {phone ? formatPhoneDisplay(phone) : <span className="text-gray-300">010-0000-0000</span>}
                </p>
              </div>

              {error && <p className="text-red-500 text-[16px] text-center mb-[12px]">{error}</p>}

              {/* 키패드 */}
              <Keypad onPress={handleKeyPress}/>

              {/* 확인 버튼 */}
              <button
                  onClick={handleSearch}
                  disabled={loading || phone.length < 10}
                  className="w-full max-w-[400px] h-[64px] rounded-[16px] bg-black text-white text-[22px] font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors mt-[16px]"
              >
                {loading ? '확인 중...' : '확인'}
              </button>
            </>
        );

      case 'confirm':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                본인이 맞으신가요?
              </p>
              <p className="text-gray-400 text-[20px] mb-[40px]">
                아래 정보를 확인해주세요
              </p>

              <div className="w-full max-w-[500px] bg-gray-50 rounded-[20px] p-[32px] flex flex-col items-center gap-[20px] mb-[32px]">
                {/* 프로필 사진 */}
                <div className="w-[80px] h-[80px] rounded-full overflow-hidden bg-gray-200 shrink-0">
                  {userProfileImageUrl ? (
                      <img src={userProfileImageUrl} alt="" className="w-full h-full object-cover"/>
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-[32px]">
                        👤
                      </div>
                  )}
                </div>

                {/* 정보 */}
                <div className="w-full flex flex-col gap-[12px]">
                  {userName && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">이름</p>
                        <p className="text-black text-[20px] font-bold">{userName}</p>
                      </div>
                  )}
                  {userNickName && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">닉네임</p>
                        <p className="text-black text-[20px] font-bold">{userNickName}</p>
                      </div>
                  )}
                  {userPhone && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">전화번호</p>
                        <p className="text-black text-[20px] font-bold">{formatPhoneDisplay(userPhone)}</p>
                      </div>
                  )}
                  {userEmail && (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-[18px]">이메일</p>
                        <p className="text-black text-[20px] font-bold">{userEmail}</p>
                      </div>
                  )}
                </div>
              </div>

              {error && <p className="text-red-500 text-[16px] text-center mb-[12px]">{error}</p>}

              <div className="w-full max-w-[500px] flex flex-col gap-[12px]">
                <button
                    onClick={() => {
                      if (userId) callKioskApi(userId);
                    }}
                    className="w-full h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium transition-colors"
                >
                  수업 신청하기
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
                  본인이 아닙니다
                </button>
              </div>
            </>
        );

      case 'name':
        return (
            <>
              <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                이름을 입력해주세요
              </p>
              <p className="text-gray-400 text-[20px] mb-[48px]">
                등록되지 않은 번호입니다. 이름을 알려주세요
              </p>
              <div className="w-full max-w-[500px] flex flex-col gap-[20px]">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    placeholder="이름 입력"
                    className="w-full h-[72px] rounded-[16px] border-2 border-gray-200 px-[24px] text-[28px] text-center font-medium focus:border-black focus:outline-none transition-colors"
                    autoFocus
                />
                {error && <p className="text-red-500 text-[16px] text-center">{error}</p>}
                <button
                    onClick={handleNameSubmit}
                    disabled={loading || !name.trim()}
                    className="w-full h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '처리 중...' : '확인'}
                </button>
              </div>
            </>
        );

      case 'loading':
        return (
            <>
              <div
                  className="w-[60px] h-[60px] border-4 border-gray-200 border-t-black rounded-full animate-spin mb-[32px]"/>
              <p className="text-black text-[28px] font-bold tracking-[-0.84px]">
                신청 처리 중...
              </p>
            </>
        );

      case 'complete': {
        const successItems = paymentResults.filter((r) => !r.reason);
        const failedItems = paymentResults.filter((r) => r.reason);
        const allFailed = successItems.length === 0 && failedItems.length > 0;
        return (
            <>
              {allFailed ? (
                  <div className="w-[80px] h-[80px] rounded-full bg-red-500 flex items-center justify-center mb-[32px]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round"
                            strokeLinejoin="round"/>
                    </svg>
                  </div>
              ) : (
                  <div className="w-[80px] h-[80px] rounded-full bg-black flex items-center justify-center mb-[32px]">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round"
                            strokeLinejoin="round"/>
                    </svg>
                  </div>
              )}

              {allFailed ? (
                  <>
                    <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                      수업 신청에 실패했어요
                    </p>
                    <p className="text-gray-400 text-[20px] mb-[32px]">
                      데스크에 문의해주세요
                    </p>
                  </>
              ) : (
                  <>
                    <p className="text-black text-[36px] font-bold tracking-[-1px] mb-[16px]">
                      {successItems.length}개의 수업을 성공적으로 신청했어요
                    </p>
                    <p className="text-gray-400 text-[20px] mb-[32px]">
                      데스크에서 결제를 완료해주세요
                    </p>
                  </>
              )}

              {failedItems.length > 0 && !allFailed && (
                  <div className="w-full max-w-[500px] bg-red-50 rounded-[16px] p-[20px] mb-[32px] flex flex-col gap-[8px]">
                    <p className="text-red-500 text-[16px] font-bold">{failedItems.length}개의 수업은 신청에 실패했어요</p>
                    {failedItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-black text-[15px]">{item.lesson?.title ?? '수업'}</p>
                          <p className="text-red-500 text-[14px]">{item.reason}</p>
                        </div>
                    ))}
                  </div>
              )}

              {allFailed && (
                  <div className="w-full max-w-[500px] bg-red-50 rounded-[16px] p-[20px] mb-[32px] flex flex-col gap-[8px]">
                    {failedItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-black text-[15px]">{item.lesson?.title ?? '수업'}</p>
                          <p className="text-red-500 text-[14px]">{item.reason}</p>
                        </div>
                    ))}
                  </div>
              )}

              <button
                  onClick={onComplete}
                  className="w-full max-w-[500px] h-[72px] rounded-[16px] bg-black text-white text-[22px] font-medium transition-colors"
              >
                확인
              </button>
            </>
        );
      }
    }
  };

  return (
      <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="h-[70px] px-[48px] flex items-center justify-between shrink-0 border-b border-gray-100">
          {step !== 'complete' && step !== 'loading' ? (
              <button onClick={onBack}
                      className="w-[40px] h-[40px] flex items-center justify-center active:opacity-70 transition-opacity">
                <BackArrowIcon className="w-full h-full"/>
              </button>
          ) : (
              <div className="w-[40px]"/>
          )}
          <p className="text-black text-[20px] font-bold">본인 확인</p>
          <p className="text-gray-500 text-[16px] tracking-[-0.48px]">
            {studioName}
          </p>
        </div>

        {/* 메인 영역 */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-[48px] py-[40px]">
          {renderContent()}
        </div>

        {/* 하단 카운트다운 */}
        {step !== 'complete' && (
            <div className="px-[48px] pb-[40px] flex justify-center shrink-0">
              <p className="text-[18px] tracking-[-0.54px]">
                <span className="font-semibold text-black">{formatTime(countdown)}</span>
                <span className="text-gray-300"> 뒤 첫 화면으로 돌아갑니다</span>
              </p>
            </div>
        )}
      </div>
  );
};
