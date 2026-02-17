'use client'

import React, {useState} from "react";
import {KioskHomeForm} from "@/app/profile/setting/kiosk/KioskHomeForm";
import {KioskLessonSelectionForm} from "@/app/profile/setting/kiosk/KioskLessonSelectionForm";
import {KioskPaymentForm} from "@/app/profile/setting/kiosk/KioskPaymentForm";
import {KioskPhoneForm} from "@/app/profile/setting/kiosk/KioskPhoneForm";
import {KioskAttendanceForm} from "@/app/profile/setting/kiosk/KioskAttendanceForm";
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";

type KioskScreen = 'home' | 'lesson-selection' | 'payment' | 'phone' | 'attendance';

export const KioskForm = ({studioId, studioName, studioProfileImageUrl, kioskImageUrl}: {studioId: number; studioName: string; studioProfileImageUrl?: string; kioskImageUrl?: string}) => {
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>('home');
  const [selectedLessons, setSelectedLessons] = useState<GetLessonResponse[]>([]);

  const handleSelectPayment = () => {
    setCurrentScreen('lesson-selection');
  };

  const handleSelectVisit = () => {
    setCurrentScreen('attendance');
  };

  const handleBack = () => {
    if (currentScreen === 'attendance') {
      setCurrentScreen('home');
    } else if (currentScreen === 'phone') {
      setCurrentScreen('payment');
    } else if (currentScreen === 'payment') {
      setCurrentScreen('lesson-selection');
      // 선택된 수업은 유지
    } else if (currentScreen === 'lesson-selection') {
      setCurrentScreen('home');
      setSelectedLessons([]);
    }
  };

  const handleSelectLessons = (lessons: GetLessonResponse[]) => {
    setSelectedLessons(lessons);
    setCurrentScreen('payment');
  };

  const handlePaymentComplete = () => {
    setCurrentScreen('phone');
  };

  const handlePhoneComplete = () => {
    setCurrentScreen('home');
    setSelectedLessons([]);
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
                onSelectPayment={handleSelectPayment}
                onSelectVisit={handleSelectVisit}
            />
        )}
        {currentScreen === 'lesson-selection' && (
            <KioskLessonSelectionForm
                studioName={studioName}
                onBack={handleBack}
                onSelectLessons={handleSelectLessons}
                studioId={studioId}
            />
        )}
        {currentScreen === 'payment' && (
            <KioskPaymentForm
                studioName={studioName}
                lessons={selectedLessons}
                onBack={handleBack}
                onComplete={handlePaymentComplete}
            />
        )}
        {currentScreen === 'phone' && (
            <KioskPhoneForm
                studioName={studioName}
                lessons={selectedLessons}
                onBack={handleBack}
                onComplete={handlePhoneComplete}
            />
        )}
        {currentScreen === 'attendance' && (
            <KioskAttendanceForm
                studioName={studioName}
                onBack={handleBack}
                onComplete={handleAttendanceComplete}
            />
        )}
      </div>
  );
}