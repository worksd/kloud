'use client'

import Logo from "../../public/assets/logo_black.svg"

export default function Error() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {/* 404 아이콘 */}
      <div className="mb-8">
        <Logo/>
      </div>

      {/* 메시지 */}
      <h1 className="text-[20px] font-bold text-black mb-4">
        에러가 발생했습니다.
      </h1>

      <p className="text-[16px] text-[#86898C] text-center mb-8 max-w-md">
        요청하신 페이지를 불러올 수 없습니다.
      </p>

      {/* 홈으로 돌아가기 버튼 */}
      <div
        className="px-6 py-3 bg-black text-white rounded-lg font-semibold
          transition-transform duration-100 active:scale-[0.98]
          hover:bg-gray-800"
        onClick={() => window.KloudEvent?.back()}
      >
        뒤로가기
      </div>
    </div>
  );
}