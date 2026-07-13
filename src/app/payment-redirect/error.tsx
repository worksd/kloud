'use client';

// /payment-redirect에서 결제기록 조회 등이 실패해 예외가 나도 흰 화면 대신 안내를 보여준다.
export default function PaymentRedirectError() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-6 text-center bg-white">
      <p className="text-[16px] text-[#4E5968] whitespace-pre-line leading-relaxed">
        {'결제 결과를 확인하지 못했어요.\n결제 내역에서 다시 확인해주세요.'}
      </p>
    </div>
  );
}
