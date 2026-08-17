// 라우트 전환 중 빈 화면 fallback.
// data-route-loading: PC 웹 푸터가 이 마커를 보고 스스로 숨는다(globals.css body:has 규칙) —
// 전환 중 페이지 높이가 무너질 때 푸터가 한 프레임 노출되는 깜빡임 방지.
export default function Loading() {
  return <div data-route-loading/>
}
