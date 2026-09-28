'use client';

import React, { useState } from 'react';
import { BusinessStudioResponse, UpdateStudioRequest } from '@/app/endpoint/studio.endpoint';
import { Card, Field, NumberInput, SaveBar, SettingShell, inputCls, useSave } from '@/app/admin/setting/SettingKit';

const MAX_GUIDE = 300;
/** 서버와 같은 정규화 — 줄 끝 공백·CR 을 걷어낸 뒤 센다 */
const normalizeGuide = (v: string) => v.replace(/\r/g, '').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n');

function GuideTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const len = normalizeGuide(value).length;
  return (
    <>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className={`${inputCls} resize-none leading-relaxed`}
      />
      <span className={`block mt-1 text-right text-[11.5px] ${len > MAX_GUIDE ? 'text-[#E55B5B] font-semibold' : 'text-[#8B95A1]'}`}>{len}/{MAX_GUIDE}</span>
    </>
  );
}

export function RoomSettingsForm({ initial, studioName }: { initial: BusinessStudioResponse; studioName?: string }) {
  const [refundDays, setRefundDays] = useState(initial.roomRefundDays != null ? String(initial.roomRefundDays) : '');
  const [noticeHours, setNoticeHours] = useState(initial.roomNoticeHours != null ? String(initial.roomNoticeHours) : '');
  const [usageInfo, setUsageInfo] = useState(initial.roomUsageInfo ?? '');
  const [caution, setCaution] = useState(initial.roomCaution ?? '');
  const { saving, error, save, setError } = useSave();

  const onSave = () => {
    const u = normalizeGuide(usageInfo);
    const c = normalizeGuide(caution);
    if (u.length > MAX_GUIDE || c.length > MAX_GUIDE) { setError(`이용방법과 주의사항은 각각 ${MAX_GUIDE}자까지예요`); return; }
    const body: UpdateStudioRequest = { roomUsageInfo: u, roomCaution: c };
    // 숫자 필드는 지울 수 없어 값이 있을 때만
    if (refundDays !== '') body.roomRefundDays = Number(refundDays);
    if (noticeHours !== '') body.roomNoticeHours = Number(noticeHours);
    void save(body);
  };

  return (
    <SettingShell title={'연습실 설정'} subtitle={studioName}>
      <Card title={'환불'}>
        <Field label={'전액 환불 기준'} hint={'이용 시작일 N일 전 23:59까지 취소하면 전액 환불돼요. 비우면 1일'}>
          <NumberInput value={refundDays} onChange={setRefundDays} placeholder={'1'} suffix={'일 전'}/>
        </Field>
      </Card>

      <Card title={'이용안내 알림톡'} desc={'이용방법을 비우면 이용안내를 보내지 않아요'}>
        <Field label={'발송 시점'} hint={'이용 시작 N시간 전에 보내요. 비우면 1시간'}>
          <NumberInput value={noticeHours} onChange={setNoticeHours} placeholder={'1'} suffix={'시간 전'}/>
        </Field>
        <Field label={'이용방법'}>
          <GuideTextarea value={usageInfo} onChange={setUsageInfo} placeholder={'입구 비밀번호, 조명·음향 사용법 등'}/>
        </Field>
        <Field label={'주의사항'}>
          <GuideTextarea value={caution} onChange={setCaution} placeholder={'퇴실 시 정리, 음식물 반입 등'}/>
        </Field>
      </Card>

      <SaveBar saving={saving} error={error} onSave={onSave}/>
    </SettingShell>
  );
}
