// /payment-redirect는 결제기록 반영 대기(약 2초) 후 결제상세로 redirect한다.
// 그 동안 흰 화면 대신 로딩을 보여준다. (page.tsx의 top-level await에 대한 Suspense fallback)
export default function PaymentRedirectLoading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-10 h-10 border-4 border-black/15 border-t-black rounded-full animate-spin" />
      <p className="text-[15px] text-[#6D7882]">결제 결과를 확인하고 있어요...</p>
    </div>
  );
}
