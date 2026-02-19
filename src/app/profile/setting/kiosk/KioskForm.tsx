'use client'

import React, {useState} from "react";
import {KioskHomeForm} from "@/app/profile/setting/kiosk/KioskHomeForm";
import {KioskLessonSelectionForm} from "@/app/profile/setting/kiosk/KioskLessonSelectionForm";
import {KioskPaymentForm} from "@/app/profile/setting/kiosk/KioskPaymentForm";
import {KioskPhoneForm} from "@/app/profile/setting/kiosk/KioskPhoneForm";
import {KioskAttendanceForm} from "@/app/profile/setting/kiosk/KioskAttendanceForm";
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";
import {Locale} from "@/shared/StringResource";

type KioskScreen = 'home' | 'lesson-selection' | 'phone' | 'payment' | 'attendance';

export const KioskForm = ({studioId, studioName, studioProfileImageUrl, kioskImageUrl}: {studioId: number; studioName: string; studioProfileImageUrl?: string; kioskImageUrl?: string}) => {
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>('home');
  const [selectedLessons, setSelectedLessons] = useState<GetLessonResponse[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [locale, setLocale] = useState<Locale>('ko');

  const handleSelectPayment = () => {
    setCurrentScreen('lesson-selection');
  };

  const handleSelectVisit = () => {
    setCurrentScreen('attendance');
  };

  const handleBack = () => {
    if (currentScreen === 'attendance') {
      setCurrentScreen('home');
    } else if (currentScreen === 'payment') {
      setCurrentScreen('phone');
    } else if (currentScreen === 'phone') {
      setCurrentScreen('lesson-selection');
    } else if (currentScreen === 'lesson-selection') {
      setCurrentScreen('home');
      setSelectedLessons([]);
    }
  };

  const handleSelectLessons = (lessons: GetLessonResponse[]) => {
    setSelectedLessons(lessons);
    setCurrentScreen('phone');
  };

  const handlePhoneComplete = (targetUserId: number, targetUserName?: string) => {
    setUserId(targetUserId);
    setUserName(targetUserName);
    setCurrentScreen('payment');
  };

  const handlePaymentComplete = () => {
    setCurrentScreen('home');
    setSelectedLessons([]);
    setUserId(null);
    setUserName(undefined);
  };

  const handleAttendanceComplete = () => {
    setCurrentScreen('home');
  };

  return (
      <div className="w-full h-screen overflow-hidden">
        {currentScreen === 'home' && (
            <KioskHomeForm
                studioName={studioName}
                kioskImageUrl={kioskImageUrl}
                locale={locale}
                onSelectPayment={handleSelectPayment}
                onSelectVisit={handleSelectVisit}
                onChangeLocale={setLocale}
            />
        )}
        {currentScreen === 'lesson-selection' && (
            <KioskLessonSelectionForm
                studioName={studioName}
                onBack={handleBack}
                onSelectLessons={handleSelectLessons}
                studioId={studioId}
                locale={locale}
            />
        )}
        {currentScreen === 'phone' && (
            <KioskPhoneForm
                studioName={studioName}
                onBack={handleBack}
                onComplete={handlePhoneComplete}
                locale={locale}
            />
        )}
        {currentScreen === 'payment' && userId && (
            <KioskPaymentForm
                studioName={studioName}
                lessons={selectedLessons}
                userId={userId}
                userName={userName}
                onBack={handleBack}
                onComplete={handlePaymentComplete}
                locale={locale}
            />
        )}
        {currentScreen === 'attendance' && (
            <KioskAttendanceForm
                studioName={studioName}
                onBack={handleBack}
                onComplete={handleAttendanceComplete}
                locale={locale}
            />
        )}
      </div>
  );
}
