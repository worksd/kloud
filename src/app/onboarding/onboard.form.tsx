'use client';
import { ChangeEvent, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { onboardAction } from "@/app/onboarding/onboard.action";
import { router } from "next/client";
import { KloudScreen } from "@/shared/kloud.screen";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";

export const OnboardForm = () => {
  const router = useRouter();
  const [actionState, formAction] = useFormState(onboardAction, {
    sequence: -1,
    errorCode: '',
    errorMessage: '',
    success: false,
  });

  const [name, setName] = useState(""); // 이름 상태 관리
  const [isNameSubmitted, setIsNameSubmitted] = useState(false); // 이름 제출 상태 관리
  const [allChecked, setAllChecked] = useState(false); // 모든 체크박스 체크 상태
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    privacy: false,
    all: false,
  });

  const handleNameSubmit = () => {
    if (name.trim() === "") {
      alert("이름을 입력해주세요.");
      return;
    }
    setIsNameSubmitted(true); // 이름 제출 완료
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // 개별 체크박스 상태 업데이트
    const updatedCheckboxes = {
      ...checkboxes,
      [name]: checked,
    };

    // '모두 동의' 체크박스가 변경된 경우 처리
    if (name === 'all') {
      updatedCheckboxes.terms = checked;
      updatedCheckboxes.privacy = checked;
    }

    // '모두 동의' 체크박스 상태 업데이트
    updatedCheckboxes.all =
      updatedCheckboxes.terms && updatedCheckboxes.privacy;

    setCheckboxes(updatedCheckboxes);

    // 모든 필수 체크박스가 체크되었는지 확인
    setAllChecked(updatedCheckboxes.terms && updatedCheckboxes.privacy);
  };

  useEffect(() => {
    console.log(actionState);

    if (actionState.success) {
      if (isMobile) {
        window.KloudEvent.clearAndPush(KloudScreen.Main);
      } else {
        router.push(KloudScreen.Home);
      }
    }
  }, [actionState]);

  return (
    <form className="flex flex-col h-screen bg-white px-6" action={formAction}>
      {/* 이름 입력 필드 */}
      <div className="flex flex-col space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-800">
          Name <span className="text-red-500 ml-1">필수</span>
        </label>

        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Please enter your Name"
          className="w-full border border-gray-300 rounded-md p-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500"/>
      </div>

      {!isNameSubmitted && (
        <button
          className="mt-4 bg-blue-500 text-white py-2 rounded-lg"
          onClick={handleNameSubmit}
        >
          이름 제출
        </button>
      )}

      {/* 약관 동의 부분: 이름 제출 후 렌더링 */}
      {isNameSubmitted && (
        <>
          <header className="flex items-center gap-2 py-4">
            <button className="text-lg text-black">←</button>
            <h1 className="text-lg text-black font-semibold">서비스를 위해 동의해 주세요!</h1>
          </header>

          <main className="flex-1 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-lg text-black font-medium">모두 동의하기</span>
              <input
                type="checkbox"
                name="all"
                checked={checkboxes.all}
                onChange={handleCheckboxChange}
                className="w-5 h-5 accent-gray-400"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">[필수] 서비스 이용약관</span>
                <input
                  type="checkbox"
                  name="terms"
                  checked={checkboxes.terms}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 accent-gray-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-700">[필수] 개인정보 수집 및 이용동의</span>
                <input
                  type="checkbox"
                  name="privacy"
                  checked={checkboxes.privacy}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 accent-gray-400"
                />
              </div>
            </div>
          </main>

          <div className="py-4" >
            <button
              className={`w-full py-3 rounded-lg text-lg ${
                allChecked ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}
              disabled={!allChecked} // 모든 체크박스 체크 여부에 따라 활성화/비활성화
            >
              시작하기
            </button>
          </div>
        </>
      )}
    </form>
  );
};