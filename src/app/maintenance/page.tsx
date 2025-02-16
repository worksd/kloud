// app/maintenance/page.tsx

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center p-6 text-center">

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          서버 점검 중입니다
        </h1>

        <p className="text-gray-600 mb-6">
          더 나은 서비스를 위해 시스템 점검 중입니다.<br/>
          잠시 후 다시 이용해 주시기 바랍니다.
        </p>

        <div className="text-sm text-gray-500">
          예상 점검 시간: 22:00 ~ 02:00
        </div>
      </div>
    </div>
  )
}