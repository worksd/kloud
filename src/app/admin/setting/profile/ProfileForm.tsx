'use client';

import React, { useState } from 'react';
import { BusinessStudioResponse, StudioAmenity, UpdateStudioRequest } from '@/app/endpoint/studio.endpoint';
import { AmenityResponse } from '@/app/endpoint/studio.room.endpoint';
import { Card, Field, SaveBar, SettingShell, TextInput, Toggle, useSave } from '@/app/admin/setting/SettingKit';

const AMENITIES: { key: StudioAmenity; label: string }[] = [
  { key: 'Parking', label: '주차' },
  { key: 'Wifi', label: '와이파이' },
  { key: 'AirConditioner', label: '에어컨' },
  { key: 'FittingRoom', label: '탈의실' },
  { key: 'WaterDispenser', label: '정수기' },
  { key: 'Elevator', label: '엘리베이터' },
  { key: 'Tripod', label: '삼각대' },
  { key: 'Restroom', label: '화장실' },
];

const SLUG_RE = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/;
const s = (v?: string | null) => v ?? '';

export function ProfileForm({ initial, amenities, studioName }: {
  initial: BusinessStudioResponse;
  amenities: AmenityResponse[];
  studioName?: string;
}) {
  const [name, setName] = useState(s(initial.name));
  const [phone, setPhone] = useState(s(initial.phone));
  const [address, setAddress] = useState(s(initial.address));
  const [roadAddress, setRoadAddress] = useState(s(initial.roadAddress));
  const [instagram, setInstagram] = useState(s(initial.instagramAddress));
  const [youtube, setYoutube] = useState(s(initial.youtubeUrl));
  const [tiktok, setTiktok] = useState(s(initial.tiktokUrl));
  const [x, setX] = useState(s(initial.xUrl));
  const [slug, setSlug] = useState(s(initial.slug));

  // 편의시설 — 서버 현재값으로 시작, 바꾼 항목만 보낸다(upsert)
  const initialOn = new Set(amenities.filter((a) => a.enabled).map((a) => a.amenity));
  const [on, setOn] = useState<Set<string>>(initialOn);
  const toggle = (k: StudioAmenity, v: boolean) => setOn((prev) => { const n = new Set(prev); if (v) n.add(k); else n.delete(k); return n; });

  const { saving, error, save, setError } = useSave();

  const onSave = () => {
    const slugTrim = slug.trim().toLowerCase();
    if (!name.trim()) { setError('학원 이름을 입력해주세요'); return; }
    if (slugTrim && !SLUG_RE.test(slugTrim)) { setError('URL 주소는 영문 소문자·숫자·-·_ 3~30자, 시작과 끝은 영문·숫자여야 해요'); return; }

    const body: UpdateStudioRequest = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      roadAddress: roadAddress.trim(),
      instagramAddress: instagram.trim().replace(/^@/, ''),
      youtubeUrl: youtube.trim(),
      tiktokUrl: tiktok.trim(),
      xUrl: x.trim(),
    };
    // slug 는 비우면 지울 수 없어(일반 필드 규약) 값이 있을 때만 보낸다
    if (slugTrim) body.slug = slugTrim;
    const changed = AMENITIES.filter((a) => initialOn.has(a.key) !== on.has(a.key));
    if (changed.length > 0) body.amenities = changed.map((a) => ({ amenity: a.key, enabled: on.has(a.key) }));
    void save(body);
  };

  return (
    <SettingShell title={'학원 정보'} subtitle={studioName}>
      <Card title={'기본 정보'}>
        <Field label={'학원 이름'}><TextInput value={name} onChange={setName} placeholder={'학원 이름'} maxLength={50}/></Field>
        <Field label={'연락처'}><TextInput value={phone} onChange={setPhone} placeholder={'02-000-0000'} type={'tel'} inputMode={'tel'}/></Field>
        <Field label={'도로명 주소'} hint={'주소가 바뀌면 지도 위치도 다시 잡혀요'}>
          <TextInput value={roadAddress} onChange={setRoadAddress} placeholder={'서울시 중구 서소문로 136'}/>
        </Field>
        <Field label={'지번 주소'}><TextInput value={address} onChange={setAddress} placeholder={'서울시 중구 서소문동 00-0'}/></Field>
        <Field label={'URL 주소'} hint={'rawgraphy.com/@주소 로 학원 페이지가 열려요. 영문 소문자·숫자·-·_ 3~30자'}>
          <TextInput value={slug} onChange={setSlug} placeholder={'mystudio'} maxLength={30}/>
        </Field>
      </Card>

      <Card title={'SNS'} desc={'비우면 학원 페이지에서 사라져요'}>
        <Field label={'인스타그램'}><TextInput value={instagram} onChange={setInstagram} placeholder={'계정 이름 (@ 없이)'}/></Field>
        <Field label={'유튜브'} hint={'채널 주소를 넣으면 최근 영상이 학원 페이지에 보여요'}>
          <TextInput value={youtube} onChange={setYoutube} placeholder={'https://www.youtube.com/@channel'} type={'url'}/>
        </Field>
        <Field label={'틱톡'}><TextInput value={tiktok} onChange={setTiktok} placeholder={'https://www.tiktok.com/@account'} type={'url'}/></Field>
        <Field label={'X (트위터)'}><TextInput value={x} onChange={setX} placeholder={'https://x.com/account'} type={'url'}/></Field>
      </Card>

      <Card title={'편의시설'} desc={'학원 페이지에 표시돼요'}>
        {AMENITIES.map((a) => (
          <Toggle key={a.key} label={a.label} checked={on.has(a.key)} onChange={(v) => toggle(a.key, v)}/>
        ))}
      </Card>

      <SaveBar saving={saving} error={error} onSave={onSave}/>
    </SettingShell>
  );
}
