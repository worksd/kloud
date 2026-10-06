'use client';

import React, { useState } from 'react';
import { BusinessStudioResponse, UpdateStudioRequest } from '@/app/endpoint/studio.endpoint';
import { Card, Field, SaveBar, Segmented, SettingShell, TextInput, inputCls, useSave } from '@/app/admin/setting/SettingKit';

// 은행 선택 → 이름과 포트원 영문 코드를 함께 보낸다(가이드 예: WOORI).
// 코드 표기는 BE 가이드에 전체 목록이 없어 포트원 은행 코드 관례를 따랐다 — BE 와 맞춰볼 것.
const BANKS: { name: string; code: string }[] = [
  { name: 'KB국민은행', code: 'KOOKMIN' },
  { name: '신한은행', code: 'SHINHAN' },
  { name: '우리은행', code: 'WOORI' },
  { name: '하나은행', code: 'HANA' },
  { name: 'NH농협은행', code: 'NONGHYUP' },
  { name: 'IBK기업은행', code: 'IBK' },
  { name: 'SC제일은행', code: 'SC' },
  { name: '씨티은행', code: 'CITI' },
  { name: '카카오뱅크', code: 'KAKAO' },
  { name: '토스뱅크', code: 'TOSS' },
  { name: '케이뱅크', code: 'K_BANK' },
  { name: 'iM뱅크(대구)', code: 'DAEGU' },
  { name: '부산은행', code: 'BUSAN' },
  { name: '경남은행', code: 'GYEONGNAM' },
  { name: '광주은행', code: 'GWANGJU' },
  { name: '전북은행', code: 'JEONBUK' },
  { name: '제주은행', code: 'JEJU' },
  { name: '새마을금고', code: 'SAEMAUL' },
  { name: '신협', code: 'SHINHYUP' },
  { name: '우체국', code: 'POST' },
  { name: '수협', code: 'SUHYUP' },
  { name: 'KDB산업은행', code: 'KDB' },
];

const TAX_TYPES = ['일반과세자', '간이과세자', '면세사업자'] as const;
const s = (v?: string | null) => v ?? '';

function BankSelect({ value, onChange }: { value: string; onChange: (name: string, code: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const b = BANKS.find((x) => x.name === e.target.value);
        onChange(e.target.value, b?.code ?? '');
      }}
      className={inputCls}
    >
      <option value={''}>은행 선택</option>
      {/* 서버에 저장된 이름이 목록에 없으면 그대로 보여준다 */}
      {value && !BANKS.some((b) => b.name === value) && <option value={value}>{value}</option>}
      {BANKS.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
    </select>
  );
}

export function BusinessForm({ initial, studioName }: { initial: BusinessStudioResponse; studioName?: string }) {
  const [businessName, setBusinessName] = useState(s(initial.businessName));
  const [regNo, setRegNo] = useState(s(initial.businessRegistrationNumber));
  const [representative, setRepresentative] = useState(s(initial.representative));
  const [taxType, setTaxType] = useState(s(initial.taxType));
  const [eCommerce, setECommerce] = useState(s(initial.eCommerceRegNumber));
  const [eduOffice, setEduOffice] = useState(s(initial.educationOfficeRegNumber));

  const [bank, setBank] = useState(s(initial.bank));
  const [bankCode, setBankCode] = useState(s(initial.bankCode));
  const [accountNumber, setAccountNumber] = useState(s(initial.accountNumber));
  const [depositor, setDepositor] = useState(s(initial.depositor));

  const [payoutBank, setPayoutBank] = useState(s(initial.payoutBank));
  const [payoutBankCode, setPayoutBankCode] = useState(s(initial.payoutBankCode));
  const [payoutAccountNumber, setPayoutAccountNumber] = useState(s(initial.payoutAccountNumber));
  const [payoutDepositor, setPayoutDepositor] = useState(s(initial.payoutDepositor));

  const { saving, error, save } = useSave();

  const onSave = () => {
    const body: UpdateStudioRequest = {
      businessName: businessName.trim(),
      businessRegistrationNumber: regNo.trim(),
      representative: representative.trim(),
      taxType: taxType.trim(),
      eCommerceRegNumber: eCommerce.trim(),
      educationOfficeRegNumber: eduOffice.trim(),
      bank: bank.trim(),
      accountNumber: accountNumber.trim(),
      depositor: depositor.trim(),
      payoutBank: payoutBank.trim(),
      payoutAccountNumber: payoutAccountNumber.trim(),
      payoutDepositor: payoutDepositor.trim(),
    };
    // 코드는 은행을 목록에서 골랐을 때만 — 모르는 은행명을 그대로 둔 경우 기존 코드를 유지한다
    if (bankCode) body.bankCode = bankCode;
    if (payoutBankCode) body.payoutBankCode = payoutBankCode;
    void save(body);
  };

  return (
    <SettingShell title={'사업자·계좌'} subtitle={studioName}>
      <Card title={'사업자 정보'} desc={'사업자 정보와 정산 계좌가 모두 채워지면 정산 파트너로 등록돼요'}>
        <Field label={'사업자명'}><TextInput value={businessName} onChange={setBusinessName} placeholder={'상호'}/></Field>
        <Field label={'사업자등록번호'}><TextInput value={regNo} onChange={setRegNo} placeholder={'000-00-00000'} inputMode={'numeric'}/></Field>
        <Field label={'대표자'}><TextInput value={representative} onChange={setRepresentative} placeholder={'대표자 이름'}/></Field>
        <Field label={'과세 유형'}>
          <Segmented value={taxType} options={TAX_TYPES.map((t) => ({ value: t, label: t }))} onChange={setTaxType}/>
          {taxType && !TAX_TYPES.includes(taxType as typeof TAX_TYPES[number]) && (
            <p className={'mt-1.5 text-[12px] text-[#8B95A1]'}>현재 값: {taxType}</p>
          )}
        </Field>
        <Field label={'통신판매업 신고번호'}><TextInput value={eCommerce} onChange={setECommerce} placeholder={'2024-서울중구-0000'}/></Field>
        <Field label={'교육청 등록번호'}><TextInput value={eduOffice} onChange={setEduOffice} placeholder={'제0000호'}/></Field>
      </Card>

      <Card title={'입금 계좌'} desc={'수강생이 계좌이체로 결제할 때 안내되는 계좌예요'}>
        <Field label={'은행'}><BankSelect value={bank} onChange={(n, c) => { setBank(n); setBankCode(c); }}/></Field>
        <Field label={'계좌번호'}><TextInput value={accountNumber} onChange={setAccountNumber} placeholder={'- 없이 숫자만'} inputMode={'numeric'}/></Field>
        <Field label={'예금주'}><TextInput value={depositor} onChange={setDepositor} placeholder={'예금주'}/></Field>
      </Card>

      <Card title={'정산 계좌'} desc={'앱 결제 매출을 정산받는 계좌예요'}>
        <Field label={'은행'}><BankSelect value={payoutBank} onChange={(n, c) => { setPayoutBank(n); setPayoutBankCode(c); }}/></Field>
        <Field label={'계좌번호'}><TextInput value={payoutAccountNumber} onChange={setPayoutAccountNumber} placeholder={'- 없이 숫자만'} inputMode={'numeric'}/></Field>
        <Field label={'예금주'}><TextInput value={payoutDepositor} onChange={setPayoutDepositor} placeholder={'예금주'}/></Field>
        {initial.isBankAccountVerified && <p className={'text-[12px] font-semibold text-[#1E8A55]'}>계좌 확인이 완료됐어요</p>}
      </Card>

      <SaveBar saving={saving} error={error} onSave={onSave}/>
    </SettingShell>
  );
}
