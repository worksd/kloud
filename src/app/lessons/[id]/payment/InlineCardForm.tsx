'use client'
import { useRef, useEffect } from "react";
import { CreateBillingRequest } from "@/app/endpoint/billing.endpoint";
import { Locale } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

export const InlineCardForm = ({
                                 locale,
                                 onCardInfoChange,
                               }: {
  locale: Locale,
  onCardInfoChange: (form: CreateBillingRequest | null) => void,
}) => {

  const cardRef = useRef<HTMLInputElement>(null);
  const expiryMonthRef = useRef<HTMLInputElement>(null);
  const expiryYearRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const cardNumberRef = useRef('');
  const expiryMonthValRef = useRef('');
  const expiryYearValRef = useRef('');
  const birthValRef = useRef('');
  const passwordValRef = useRef('');

  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  const emitChange = () => {
    const raw = cardNumberRef.current.replace(/\s/g, '');
    const month = expiryMonthValRef.current;
    const year = expiryYearValRef.current;
    const birth = birthValRef.current;
    const password = passwordValRef.current;

    if (raw.length >= 15 && month.length === 2 && year.length === 2 && (birth.length === 6 || birth.length === 10) && password.length === 2) {
      onCardInfoChange({
        cardNumber: cardNumberRef.current,
        expiryMonth: month,
        expiryYear: year,
        birthOrBusinessRegistrationNumber: birth,
        passwordTwoDigits: password,
      });
    } else {
      onCardInfoChange(null);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = raw.match(/.{1,4}/g)?.join(' ').trim() || '';
    cardNumberRef.current = formatted;
    e.target.value = formatted;

    if (raw.length >= 16) {
      expiryMonthRef.current?.focus();
    }
    emitChange();
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    expiryMonthValRef.current = value;
    e.target.value = value;

    if (value.length === 2) {
      expiryYearRef.current?.focus();
    }
    emitChange();
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    expiryYearValRef.current = value;
    e.target.value = value;

    if (value.length === 2) {
      birthRef.current?.focus();
    }
    emitChange();
  };

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    birthValRef.current = value;
    e.target.value = value;

    if (value.length === 6 || value.length === 10) {
      passwordRef.current?.focus();
    }
    emitChange();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    passwordValRef.current = value;
    e.target.value = value;
    emitChange();
  };

  const inputClass = "w-full bg-gray-50 text-black px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 text-[14px]";

  return (
    <div className="mt-3 space-y-3 p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E8E8]">
      <div>
        <div className="block text-[12px] text-[#999] mb-1">
          {getLocaleString({ locale, key: 'card_number_placeholder' })}
        </div>
        <input
          type="text"
          ref={cardRef}
          placeholder="1234 5678 9012 3456"
          onChange={handleCardNumberChange}
          maxLength={19}
          inputMode="numeric"
          className={inputClass}
        />
      </div>

      <div>
        <div className="block text-[12px] text-[#999] mb-1">
          {getLocaleString({ locale, key: 'expiration_date' })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="MM"
            ref={expiryMonthRef}
            inputMode="numeric"
            onChange={handleExpiryMonthChange}
            maxLength={2}
            className={`w-1/2 ${inputClass}`}
          />
          <input
            type="text"
            placeholder="YY"
            ref={expiryYearRef}
            inputMode="numeric"
            onChange={handleExpiryYearChange}
            maxLength={2}
            className={`w-1/2 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <div className="block text-[12px] text-[#999] mb-1">
          {getLocaleString({ locale, key: 'card_birthday_placeholder' })}
        </div>
        <input
          type="text"
          placeholder="ex. 880101"
          inputMode="numeric"
          ref={birthRef}
          onChange={handleBirthChange}
          maxLength={10}
          className={inputClass}
        />
      </div>

      <div>
        <div className="block text-[12px] text-[#999] mb-1">
          {getLocaleString({ locale, key: 'card_password_two_digits_placeholder' })}
        </div>
        <input
          type="password"
          placeholder="••"
          inputMode="numeric"
          ref={passwordRef}
          onChange={handlePasswordChange}
          maxLength={2}
          className={inputClass}
        />
      </div>
    </div>
  );
};
