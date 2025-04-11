import React, { useState } from "react";
import { TranslatableText } from "@/utils/TranslatableText";
import { createDialog } from "@/utils/dialog.factory";

export const VerificationEmailForm = ({ code, onVerify }: {
  code: string;
  onVerify: () => void;
}) => {
  const [inputCode, setInputCode] = useState("");

  const handleCodeChange = (value: string) => {
    setInputCode(value.replace(/[^0-9]/g, ""));
  };

  const handleSubmit = async () => {
    if (inputCode === code) {
      onVerify();
    } else {
      const dialogInfo = await createDialog('CertificationFail')
      window.KloudEvent?.showDialog(JSON.stringify(dialogInfo));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 px-6 mt-6">
        <TranslatableText
          titleResource={'input_email_six_code'}
          className="text-2xl font-bold mb-2 text-black"
        />

        <div className="relative mt-8 mb-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus={true}
            value={inputCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="w-full text-center text-2xl font-bold text-black py-4 border border-black tracking-[1em] placeholder-gray-300 focus:tracking-[1.2em] focus:scale-105 outline-none transition-all duration-300"
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleSubmit}
            disabled={inputCode.length !== 6}
            className={`px-4 py-2 rounded-lg text-sm ${
              inputCode.length === 6
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <TranslatableText titleResource={'confirm'} />
          </button>
        </div>
      </div>
    </div>
  );
};