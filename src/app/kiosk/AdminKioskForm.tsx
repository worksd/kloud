'use client';

import React from 'react';
import {KioskForm, KioskFormProps} from '@/app/kiosk/KioskForm';

// 상담실 태블릿(admin 모드) 엔트리 — mode==='admin' 키오스크의 시작점.
// 결제/스튜디오 출석/수업 출석 등 하위 플로우는 KioskForm과 공유하되,
// 홈 화면만 태블릿 상담실 UI(AdminKioskHomeForm)로 교체한다.
export const AdminKioskForm = (props: Omit<KioskFormProps, 'variant'>) => {
  return <KioskForm {...props} variant="admin" />;
};
