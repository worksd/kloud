'use client'

import React, {useState} from "react";
import {KioskHomeForm} from "@/app/profile/setting/kiosk/KioskHomeForm";
import {KioskLessonSelectionForm} from "@/app/profile/setting/kiosk/KioskLessonSelectionForm";
import {KioskPaymentForm} from "@/app/profile/setting/kiosk/KioskPaymentForm";
import {GetLessonResponse} from "@/app/endpoint/lesson.endpoint";

type KioskScreen = 'home' | 'lesson-selection' | 'payment';

export const KioskForm = ({studioId}: {studioId: number}) => {
  const [currentScreen, setCurrentScreen] = useState<KioskScreen>('home');
  const [selectedLessons, setSelectedLessons] = useState<GetLessonResponse[]>([]);

  const handleSelectPayment = () => {
    setCurrentScreen('lesson-selection');
  };

  const handleSelectVisit = () => {
    // TODO: 방문 기록 남기기 기능 구현
    console.log('방문 기록 남기기');
  };

  const handleBack = () => {
    if (currentScreen === 'payment') {
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
    // TODO: 결제 완료 처리
    console.log('결제 완료', selectedLessons);
    // 결제 완료 후 홈으로 돌아가기
    setCurrentScreen('home');
    setSelectedLessons([]);
  };

  return (
      <div className="w-full h-screen overflow-hidden">
        {currentScreen === 'home' && (
            <KioskHomeForm
                onSelectPayment={handleSelectPayment}
                onSelectVisit={handleSelectVisit}
            />
        )}
        {currentScreen === 'lesson-selection' && (
            <KioskLessonSelectionForm
                onBack={handleBack}
                onSelectLessons={handleSelectLessons}
                studioId={studioId}
            />
        )}
        {currentScreen === 'payment' && (
            <KioskPaymentForm
                lessons={selectedLessons}
                onBack={handleBack}
                onComplete={handlePaymentComplete}
            />
        )}
      </div>
  );
}