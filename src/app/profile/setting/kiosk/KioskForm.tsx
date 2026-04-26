'use client'

import React, {useState, useEffect, useCallback} from "react";
import {KioskHomeForm} from "@/app/profile/setting/kiosk/KioskHomeForm";
import {KioskLessonListForm} from "@/app/profile/setting/kiosk/KioskLessonListForm";
import {KioskLessonDetailModal} from "@/app/profile/setting/kiosk/KioskLessonDetailModal";
import {KioskPhoneInputForm} from "@/app/profile/setting/kiosk/KioskPhoneInputForm";
import {KioskMemberConfirmModal} from "@/app/profile/setting/kiosk/KioskMemberConfirmModal";
import {KioskPaymentMethodForm} from "@/app/profile/setting/kiosk/KioskPaymentMethodForm";
import {KioskPassSelectModal} from "@/app/profile/setting/kiosk/KioskPassSelectModal";
import {KioskAttendanceForm} from "@/app/profile/setting/kiosk/KioskAttendanceForm";
import {Locale} from "@/shared/StringResource";
import {kioskPhoneLoginAction, kioskClearTokenAction, kioskSaveTokenAction} from "@/app/profile/setting/kiosk/kiosk.actions";

type MockLesson = {
  id: number;
  title: string;
  time: string;
  thumbnailUrl: string;
  price: number;
};

type SearchedUser = {
  id: number;
  name?: string;
  nickName?: string;
  phone?: string;
  profileImageUrl?: string;
  accessToken?: string;
};

type KioskScreen = 'home' | 'lesson-list' | 'lesson-detail' | 'phone' | 'searching' | 'member-confirm' | 'payment-method' | 'pass-select' | 'attendance';

export const KioskForm = ({studioId, studioName, studioProfileImageUrl, kioskImageUrl}: {studioId: number; studioName: string; studioProfileImageUrl?: string; kioskImageUrl?: string}) => {
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>('home');
  const [selectedLesson, setSelectedLesson] = useState<MockLesson | null>(null);
  const [phone, setPhone] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
  const [locale, setLocale] = useState<Locale>('ko');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<{ status: 'success' | 'fail'; data: Record<string, unknown> } | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // 홈 진입 시 토큰 초기화
  const goHome = useCallback(async () => {
    setCurrentScreen('home');
    setSelectedLesson(null);
    setPhone('');
    setSearchedUsers([]);
    setSelectedUser(null);
    await kioskClearTokenAction();
  }, []);

  // 최초 마운트 시에도 토큰 초기화
  useEffect(() => {
    kioskClearTokenAction();
  }, []);

  // 결제 성공 다이얼로그 10초 후 자동 홈 이동
  useEffect(() => {
    if (paymentResult?.status !== 'success') return;
    const timer = setTimeout(() => {
      setPaymentResult(null);
      goHome();
    }, 10000);
    return () => clearTimeout(timer);
  }, [paymentResult, goHome]);

  // 전화번호 입력 후 phone-login API 호출
  const handlePhoneNext = async (phoneNumber: string) => {
    setPhone(phoneNumber);
    setCurrentScreen('searching');
    setErrorMessage(null);

    try {
      const res = await kioskPhoneLoginAction(phoneNumber);
      if ('success' in res) {
        setSelectedUser({
          id: res.userId,
          name: res.name,
          nickName: res.nickName,
          accessToken: res.accessToken,
        });
        setCurrentScreen('member-confirm');
      } else {
        const msg = 'message' in res ? (res as any).message : '로그인에 실패했습니다.';
        setErrorMessage(msg);
        setCurrentScreen('phone');
      }
    } catch {
      setErrorMessage('요청에 실패했습니다.\n다시 시도해주세요.');
      setCurrentScreen('phone');
    }
  };

  // 유저 확인 → 토큰 저장 → 결제 수단 선택으로 이동
  const handleConfirmUser = async () => {
    if (!selectedUser?.accessToken) return;
    await kioskSaveTokenAction(selectedUser.accessToken, selectedUser.id);
    setCurrentScreen('payment-method');
  };

  // 카드 결제: KIS 단말기 호출 → 응답 콜백으로 처리
  const handleCardPayment = useCallback(() => {
    if (!selectedLesson || isPaying) return;
    setIsPaying(true);
    setPaymentResult(null);

    type KisResult = {
      success?: boolean;
      canceled?: boolean;
      outReplyCode?: string;
      outReplyMsg1?: string;
      outAuthNo?: string;
      outAuthDate?: string;
      outVankey?: string;
      outCustomerUuid?: string;
    };
    type KisWindow = Window & { onKisPaymentResult?: (result: KisResult) => void };

    (window as KisWindow).onKisPaymentResult = (result) => {
      setIsPaying(false);
      delete (window as KisWindow).onKisPaymentResult;
      console.log('KIS 결제 응답:', result);

      const data = (result ?? {}) as Record<string, unknown>;
      if (result?.canceled) {
        return;
      }
      // TODO: 성공 시 백엔드에 거래정보 저장 (outAuthNo / outVankey / outCustomerUuid 등)
      setPaymentResult({ status: result?.success ? 'success' : 'fail', data });
    };

    window.KloudEvent?.requestKisPayment?.(JSON.stringify({
      inTestMode: 'Y',
      inTranCode: 'D1',
      inTotAmt: `${selectedLesson.price}`,
      inInstallment: '00',
    }));
  }, [selectedLesson, isPaying]);

  return (
    <div className="w-full h-screen overflow-hidden">
      {currentScreen === 'home' && (
        <KioskHomeForm
          studioName={studioName}
          kioskImageUrl={kioskImageUrl}
          locale={locale}
          onSelectPayment={() => setCurrentScreen('lesson-list')}
          onSelectVisit={() => setCurrentScreen('attendance')}
          onChangeLocale={setLocale}
        />
      )}

      {currentScreen === 'lesson-list' && (
        <KioskLessonListForm
          locale={locale}
          onSelectLesson={(lesson) => { setSelectedLesson(lesson); setCurrentScreen('lesson-detail'); }}
          onBack={goHome}
          onChangeLocale={setLocale}
        />
      )}

      {currentScreen === 'lesson-detail' && selectedLesson && (
        <>
          <KioskLessonListForm
            locale={locale}
            onSelectLesson={() => {}}
            onBack={goHome}
            onChangeLocale={setLocale}
          />
          <KioskLessonDetailModal
            lesson={selectedLesson}
            locale={locale}
            onClose={() => setCurrentScreen('lesson-list')}
            onPayment={() => setCurrentScreen('phone')}
          />
        </>
      )}

      {(currentScreen === 'phone' || currentScreen === 'searching') && (
        <KioskPhoneInputForm
          locale={locale}
          onBack={() => setCurrentScreen('lesson-list')}
          onNext={handlePhoneNext}
          onHome={goHome}
          onChangeLocale={setLocale}
          loading={currentScreen === 'searching'}
          errorMessage={errorMessage}
          onDismissError={() => setErrorMessage(null)}
        />
      )}

      {currentScreen === 'member-confirm' && selectedUser && (
        <>
          <KioskPhoneInputForm
            locale={locale}
            onBack={() => setCurrentScreen('lesson-list')}
            onNext={() => {}}
            onHome={goHome}
            onChangeLocale={setLocale}
          />
          <KioskMemberConfirmModal
            phone={phone}
            userName={selectedUser.nickName ?? selectedUser.name ?? ''}
            profileImageUrl={selectedUser.profileImageUrl}
            locale={locale}
            onBack={() => setCurrentScreen('phone')}
            onConfirm={handleConfirmUser}
          />
        </>
      )}

      {currentScreen === 'payment-method' && selectedLesson && (
        <KioskPaymentMethodForm
          lessonTitle={selectedLesson.title}
          price={selectedLesson.price}
          locale={locale}
          onBack={() => setCurrentScreen('phone')}
          onSelectPass={() => setCurrentScreen('pass-select')}
          onSelectCard={handleCardPayment}
          onHome={goHome}
          onChangeLocale={setLocale}
        />
      )}

      {paymentResult?.status === 'success' && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%]">
          <div className="bg-white rounded-[32px] w-full max-w-[720px] p-[min(3.7vw,40px)] flex flex-col items-center">
            <p className="text-[#1E2124] font-bold text-center" style={{ fontSize: 'min(3.7vw, 40px)' }}>
              {selectedLesson?.title ?? ''}
            </p>
            <p className="text-[#1E2124] font-bold text-center mt-[min(1.8vw,20px)]" style={{ fontSize: 'min(4.4vw, 48px)' }}>
              결제를 성공했습니다
            </p>
            <button
              onClick={() => { setPaymentResult(null); setCurrentScreen('lesson-list'); }}
              className="mt-[min(3.7vw,40px)] w-full h-[min(11vw,120px)] rounded-[24px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>다른 수업도 구매하기</span>
            </button>
            <button
              onClick={() => { setPaymentResult(null); goHome(); }}
              className="mt-[min(1.8vw,20px)] w-full h-[min(11vw,120px)] rounded-[24px] bg-[#F2F4F6] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-[#1E2124] font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>홈으로 돌아가기</span>
            </button>
            <p className="text-[#86898C] mt-[min(2.6vw,28px)]" style={{ fontSize: 'min(2.2vw, 24px)' }}>
              이 페이지는 10초 후에 자동으로 돌아갑니다
            </p>
          </div>
        </div>
      )}

      {paymentResult?.status === 'fail' && (
        <div className="fixed inset-0 z-30 bg-black/50 flex items-center justify-center px-[5%]">
          <div className="bg-white rounded-[32px] w-full max-w-[720px] p-[min(3.7vw,40px)] flex flex-col items-center">
            <p className="text-[#1E2124] font-bold text-center" style={{ fontSize: 'min(4vw, 44px)' }}>
              결제 실패
            </p>
            <div className="w-full mt-[min(2.6vw,28px)] bg-[#F9F9FB] rounded-[16px] p-[min(2.2vw,24px)] max-h-[60vh] overflow-auto">
              <pre className="text-[#1E2124] whitespace-pre-wrap break-all font-mono" style={{ fontSize: 'min(2vw, 22px)' }}>
                {Object.entries(paymentResult.data).length === 0
                  ? '(응답 없음)'
                  : Object.entries(paymentResult.data)
                      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                      .join('\n')}
              </pre>
            </div>
            <button
              onClick={() => setPaymentResult(null)}
              className="mt-[min(3.7vw,40px)] w-full h-[min(11vw,120px)] rounded-[24px] bg-[#1E2124] flex items-center justify-center active:scale-[0.97] transition-transform"
            >
              <span className="text-white font-bold" style={{ fontSize: 'min(3.7vw, 40px)' }}>확인</span>
            </button>
          </div>
        </div>
      )}

      {currentScreen === 'pass-select' && selectedLesson && (
        <>
          <KioskPaymentMethodForm
            lessonTitle={selectedLesson.title}
            price={selectedLesson.price}
            locale={locale}
            onBack={() => setCurrentScreen('phone')}
            onSelectPass={() => {}}
            onSelectCard={() => {}}
            onHome={goHome}
            onChangeLocale={setLocale}
          />
          <KioskPassSelectModal
            locale={locale}
            onBack={() => setCurrentScreen('payment-method')}
            onSelectPass={(pass) => { /* TODO: 패스 사용 처리 */ goHome(); }}
          />
        </>
      )}

      {currentScreen === 'attendance' && (
        <KioskAttendanceForm
          studioName={studioName}
          onBack={goHome}
          onComplete={goHome}
          locale={locale}
        />
      )}
    </div>
  );
}
