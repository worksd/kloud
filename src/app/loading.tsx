// 라우트 전환 중 fallback — 빈 화면 대신 상단 프로그레스 바 + 중앙 스피너.
// data-route-loading: PC 웹 푸터가 이 마커를 보고 스스로 숨는다(globals.css body:has 규칙) —
// 전환 중 페이지 높이가 무너질 때 푸터가 한 프레임 노출되는 깜빡임 방지.
export default function Loading() {
  return (
    <div data-route-loading>
      {/* 상단 인디터미네이트 바 — 상단바(z-50)/다이얼로그보다 위에서 항상 보이게 */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[120] overflow-hidden pointer-events-none">
        <div
          className="h-full w-2/5 bg-black rounded-full"
          style={{ animation: 'routeProgress 1.1s ease-in-out infinite' }}
        />
      </div>

      {/* 중앙 스피너 — 컨텐츠 영역이 비는 동안의 자리 표시 */}
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[3px] border-[#e8eaed] border-t-black animate-spin"/>
      </div>
    </div>
  );
}
