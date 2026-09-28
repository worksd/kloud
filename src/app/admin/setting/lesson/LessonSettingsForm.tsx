'use client';

import React, { useState } from 'react';
import { BusinessStudioResponse, StudioPaymentMethodResponse, TicketAutoUse, UpdateStudioRequest } from '@/app/endpoint/studio.endpoint';
import { Card, Field, NumberInput, SaveBar, Segmented, SettingShell, TimeInput, Toggle, useSave } from '@/app/admin/setting/SettingKit';

const methodLabel = (m: StudioPaymentMethodResponse) => {
  const p = m.paymentMethod;
  return (p?.label ?? p?.name ?? p?.title ?? p?.type ?? p?.methodType ?? `결제수단 #${m.id}`) as string;
};

/** N일 전 + HH:mm 짝. 서버 규약상 둘 다 값이거나 둘 다 null 이어야 한다 */
function SchedulePair({ label, desc, enabled, days, time, onEnabled, onDays, onTime }: {
  label: string; desc: string;
  enabled: boolean; days: string; time: string;
  onEnabled: (v: boolean) => void; onDays: (v: string) => void; onTime: (v: string) => void;
}) {
  return (
    <>
      <Toggle label={label} desc={desc} checked={enabled} onChange={onEnabled}/>
      {enabled && (
        <div className={'flex gap-2'}>
          <div className={'flex-1'}>
            <Field label={'수업일 며칠 전'}><NumberInput value={days} onChange={onDays} placeholder={'7'} suffix={'일 전'}/></Field>
          </div>
          <div className={'flex-1'}>
            <Field label={'시각'}><TimeInput value={time} onChange={onTime}/></Field>
          </div>
        </div>
      )}
    </>
  );
}

export function LessonSettingsForm({ initial, studioName }: { initial: BusinessStudioResponse; studioName?: string }) {
  const hasOpen = initial.daysBeforeOpen != null && !!initial.lessonOpenTime;
  const hasSale = initial.daysBeforeSale != null && !!initial.lessonSaleTime;

  const [openOn, setOpenOn] = useState(hasOpen);
  const [openDays, setOpenDays] = useState(hasOpen ? String(initial.daysBeforeOpen) : '');
  const [openTime, setOpenTime] = useState(initial.lessonOpenTime ?? '00:00');
  const [saleOn, setSaleOn] = useState(hasSale);
  const [saleDays, setSaleDays] = useState(hasSale ? String(initial.daysBeforeSale) : '');
  const [saleTime, setSaleTime] = useState(initial.lessonSaleTime ?? '00:00');
  const [closeOn, setCloseOn] = useState(!!initial.lessonCloseTime);
  const [closeTime, setCloseTime] = useState(initial.lessonCloseTime ?? '23:00');

  const [autoCancelHours, setAutoCancelHours] = useState(initial.hoursAfterAutoCancelAccountTransfer != null ? String(initial.hoursAfterAutoCancelAccountTransfer) : '');
  const [ticketAutoUse, setTicketAutoUse] = useState<TicketAutoUse>(initial.ticketAutoUse ?? 'None');
  const [postponeLimit, setPostponeLimit] = useState(initial.lessonPostponeLimit != null ? String(initial.lessonPostponeLimit) : '');
  const [unpaidEnabled, setUnpaidEnabled] = useState(!!initial.lessonUnpaidEnabled);

  // 결제수단 — 전체 덮어쓰기 규약이라 토글을 한 번이라도 건드렸을 때만 id 전체를 보낸다
  const methods = initial.studioPaymentMethods ?? [];
  const [enabledIds, setEnabledIds] = useState<Set<number>>(new Set(methods.filter((m) => m.isEnabled).map((m) => m.id)));
  const [methodsDirty, setMethodsDirty] = useState(false);
  const toggleMethod = (id: number, v: boolean) => {
    setMethodsDirty(true);
    setEnabledIds((prev) => { const n = new Set(prev); if (v) n.add(id); else n.delete(id); return n; });
  };

  const { saving, error, save, setError } = useSave();

  const onSave = () => {
    if (openOn && (!openDays || !openTime)) { setError('공개 일정의 일수와 시각을 모두 입력해주세요'); return; }
    if (saleOn && (!saleDays || !saleTime)) { setError('예약 가능 일정의 일수와 시각을 모두 입력해주세요'); return; }
    if (closeOn && !closeTime) { setError('결제 마감 시각을 입력해주세요'); return; }

    const body: UpdateStudioRequest = {
      daysBeforeOpen: openOn ? Number(openDays) : null,
      lessonOpenTime: openOn ? openTime : null,
      daysBeforeSale: saleOn ? Number(saleDays) : null,
      lessonSaleTime: saleOn ? saleTime : null,
      lessonCloseTime: closeOn ? closeTime : null,
      ticketAutoUse,
      lessonUnpaidEnabled: unpaidEnabled,
    };
    // 숫자 필드는 지울 수 없어(일반 필드 규약) 값이 있을 때만 보낸다
    if (autoCancelHours !== '') body.hoursAfterAutoCancelAccountTransfer = Number(autoCancelHours);
    if (postponeLimit !== '') body.lessonPostponeLimit = Number(postponeLimit);
    if (methodsDirty) body.studioPaymentMethodIds = Array.from(enabledIds);
    void save(body, () => setMethodsDirty(false));
  };

  return (
    <SettingShell title={'수업·결제 설정'} subtitle={studioName}>
      <Card title={'공개·예약 일정'} desc={'끄면 수업을 만들자마자 공개·예약할 수 있어요'}>
        <SchedulePair
          label={'수업 공개 시점'} desc={'수업일 N일 전 정해진 시각부터 수강생에게 보여요'}
          enabled={openOn} days={openDays} time={openTime}
          onEnabled={setOpenOn} onDays={setOpenDays} onTime={setOpenTime}
        />
        <SchedulePair
          label={'예약 시작 시점'} desc={'수업일 N일 전 정해진 시각부터 결제할 수 있어요'}
          enabled={saleOn} days={saleDays} time={saleTime}
          onEnabled={setSaleOn} onDays={setSaleDays} onTime={setSaleTime}
        />
        <Toggle label={'결제 마감 시각'} desc={'수업 당일 이 시각이 지나면 결제할 수 없어요'} checked={closeOn} onChange={setCloseOn}/>
        {closeOn && <TimeInput value={closeTime} onChange={setCloseTime}/>}
      </Card>

      <Card title={'수강권'}>
        <Field label={'자동 사용처리'} hint={'당일 수업을 현장결제·키오스크로 결제하면 발급 즉시 사용처리할지'}>
          <Segmented
            value={ticketAutoUse}
            options={[{ value: 'None', label: 'QR 체크인으로만' }, { value: 'SameDayOnSite', label: '당일 현장결제는 즉시' }]}
            onChange={setTicketAutoUse}
          />
        </Field>
        <Field label={'수업 미루기 허용 횟수'} hint={'결제 1건당 수강생이 다음 회차로 미룰 수 있는 횟수. 0이면 허용 안 함'}>
          <NumberInput value={postponeLimit} onChange={setPostponeLimit} placeholder={'0'} suffix={'회'}/>
        </Field>
        <Toggle label={'미납 수강 허용'} desc={'수강권을 다 쓴 뒤에도 결제 전에 수업을 들을 수 있어요'} checked={unpaidEnabled} onChange={setUnpaidEnabled}/>
      </Card>

      <Card title={'계좌이체'}>
        <Field label={'미입금 자동취소'} hint={'결제 후 이 시간 안에 입금이 없으면 자동으로 취소돼요'}>
          <NumberInput value={autoCancelHours} onChange={setAutoCancelHours} placeholder={'24'} suffix={'시간'}/>
        </Field>
      </Card>

      {methods.length > 0 && (
        <Card title={'결제수단'} desc={'수강생이 결제할 때 고를 수 있는 수단이에요'}>
          {methods.map((m) => (
            <Toggle key={m.id} label={methodLabel(m)} checked={enabledIds.has(m.id)} onChange={(v) => toggleMethod(m.id, v)}/>
          ))}
        </Card>
      )}

      <SaveBar saving={saving} error={error} onSave={onSave}/>
    </SettingShell>
  );
}
