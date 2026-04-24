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
          onSelectCard={() => { /* TODO: 카드 결제 */ goHome(); }}
          onHome={goHome}
          onChangeLocale={setLocale}
        />
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
