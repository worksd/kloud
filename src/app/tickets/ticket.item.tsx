import Image from "next/image"

export const TicketItem = () => {

  return (
    <div className="bg-white">
      {/* 상단 날짜와 상태 */}
      <div className="flex justify-between items-center px-6">
        <span className="text-[#86898C] text-lg text-[14px] font-semibold">2024. 10. 03 (금)</span>
        <span className="text-[#86898C] px-2 py-1 rounded-full border border-[#86898C] text-[12px]">주문상세</span>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex gap-3 px-6 mb-3">
        {/* 이미지 */}
        <div style={{width: '84px', height: '120px', position: 'relative'}}>
          <Image
            src="https://picsum.photos/250/250"
            alt="수업 썸네일"
            fill
            style={{
              objectFit: 'cover',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* 텍스트 정보 */}
        <div className="flex flex-col justify-center">
        {/* 제목 */}
          <h2 className="text-[16px] font-bold mb-1 text-black">트릭스 힙합 클래스 초보반</h2>

          {/* 스튜디오 정보 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-[18px] text-black">1M</span>
            <span className="text-[#86898C]">원밀리언 댄스 스튜디오 /A홀</span>
          </div>

          {/* 일시 */}
          <p className="text-[#86898C]">
            2024.10.22 (금) 17:00 /80분
          </p>
        </div>
      </div>

      <div className="w-full h-[2px] bg-[#F7F8F9]"/>
    </div>
  );
}