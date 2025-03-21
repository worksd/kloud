import React, { useEffect, useState } from "react";
import { TranslatableText } from "@/utils/TranslatableText";

export const CertificationCodeInput = ({code, generateNewCode, certificatePhone}: {
  code: number,
  generateNewCode: () => void,
  certificatePhone: () => void
}) => {
  const [timeLeft, setTimeLeft] = useState(179);
  const [isExpired, setIsExpired] = useState(false);
  const [myCode, setMyCode] = useState("");

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResend = () => {
    setTimeLeft(179);
    setIsExpired(false);
    generateNewCode();
  };

  const onClickSubmit = () => {
    if (myCode == `${code}`) {
      certificatePhone()
    } else {
      const dialogInfo = {
        id: 'Empty',
        type: 'SIMPLE',
        title: '인증번호',
        message: '인증번호가 틀렸습니다.',
      }
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }
  }

  const handleCodeChange = async (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setMyCode(numericValue);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 px-6 mt-6">
        <TranslatableText titleResource={'input_six_code'} className="text-2xl font-bold mb-2 text-black"/>

        {/* 인증번호 입력 필드 */}
        <div className="relative mt-8 mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus={true}
            value={myCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full
               text-center
               text-2xl
               font-bold
               text-black
               py-4
               border
               border-black
               transition-all
               duration-300
               outline-none
               tracking-[1em]
               placeholder-gray-300
               focus:tracking-[1.2em]
               focus:scale-105"
          />
          {/* 선택적: 밑줄 애니메이션 효과 */}
          <div
            className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-black transition-all duration-300 group-focus-within:w-full group-focus-within:left-0"/>
        </div>

        {/* 타이머 */}
        <div className="text-right text-sm text-gray-500 mb-4">
          {formatTime(timeLeft)}
        </div>

        <div className={"flex flex-col space-y-4"}>
          <button
            onClick={onClickSubmit}
            disabled={myCode.length == 0}
            className={`px-4 py-2 rounded-lg text-sm
            ${myCode.length == 6
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-400'}`}
          >
            <TranslatableText titleResource={'confirm'}/>
          </button>

          {/* 재전송 버튼 */}
          <button
            onClick={handleResend}
            disabled={!isExpired}
            className={`px-4 py-2 rounded-lg text-sm transition ${isExpired ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
            <TranslatableText titleResource={'certification_code_retry'}/>
          </button>
        </div>

      </div>
    </div>
  );
};