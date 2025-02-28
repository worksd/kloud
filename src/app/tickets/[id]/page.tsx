import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { formatDateTime } from "@/utils/date.format";
import Image from "next/image";
import { Thumbnail } from "@/app/components/Thumbnail";
import Logo from "../../../../public/assets/logo_white.svg"
import StampCancel from "../../../../public/assets/stamp_cancel.svg"
import StampUsed from "../../../../public/assets/stamp_used.svg"
import StampNotPaid from "../../../../public/assets/stamp_not_paid.svg"
import PaymentQuestionPopup from "@/app/tickets/[id]/ArtistQuestionDialog";

export default async function TicketDetail({params, searchParams}: {
  params: Promise<{ id: number }>,
  searchParams: Promise<{ isJustPaid: string }>
}) {
  const ticket = await api.ticket.get({id: (await params).id});
  if ('id' in ticket) {
    const startTime = formatDateTime(ticket.lesson?.startTime ?? '');
    return (
      <div className="flex flex-col bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader title="레슨 수강권"/>
        </div>

        <div className="flex flex-col p-6">
          <div className="flex flex-row mt-5 rounded-[16px] bg-black p-6 items-center">

            {ticket.status == 'Cancelled' && <div className="absolute inset-0 bg-white/65 rounded-[16px]"/>}
            {ticket.status === "Pending" && (
              <div className="flex flex-col p-4 border rounded-lg bg-gray-100 justify-center">
                <div className="text-sm font-bold text-gray-700">{ticket.lesson?.title}</div>
                <div className="text-sm font-bold text-gray-700">아래 계좌로 입금해 주시면 확인 후 구매 결정해드리겠습니다.</div>
                <div className="text-sm font-bold text-gray-700">신청해주셔서 감사합니다.</div>

                <div className="flex flex-col mt-2 p-3 bg-white rounded-lg shadow">
                  <div className="text-gray-500 text-sm">예금주</div>
                  <div className="font-bold text-lg text-black">${ticket.lesson?.studio?.depositor}</div>

                  <div className="text-gray-500 text-sm">은행명</div>
                  <div className="font-bold text-lg text-black">{ticket.lesson?.studio?.bank}</div>

                  <div className="mt-2 text-gray-500 text-sm">계좌번호</div>
                  <div className="font-medium text-base text-black">{ticket.lesson?.studio?.accountNumber}</div>

                  <div className="mt-4 text-gray-500 text-sm">입금 금액</div>
                  <div className="font-bold text-xl text-red-500">
                    {new Intl.NumberFormat("ko-KR").format(ticket.lesson?.price ?? 0)}원
                  </div>
                </div>
              </div>
            )}
            {ticket.status != 'Pending' &&
              <div className={"flex flex-row items-center"}>
                <Image
                  className="w-[42px] h-[42px] rounded-full overflow-hidden flex-shrink-0 border border-[#F7F8F9]"
                  src={ticket.user?.profileImageUrl ?? ''}
                  alt={'로고 URL'}
                  width={42}
                  height={42}
                />
                <div className="flex flex-col ml-3">
                  <div className="font-bold text-[18px]">
                    {ticket.user?.nickName}
                    {ticket.user?.name ? ` (${ticket.user.name})` : ""}
                  </div>
                  <div className="font-medium text-[14px]">
                    {ticket.user?.email}
                  </div>
                </div>
              </div>}

          </div>

          <div className="flex flex-col mt-0.5 relative">
            <Thumbnail url={ticket.lesson?.thumbnailUrl ?? ''}/>
            <div className="absolute inset-0 bg-black/65 rounded-[16px]"/>
            {ticket.status != 'Paid' && <div className="absolute inset-0 bg-white/65 rounded-[16px]"/>}

            <div className={"absolute inset-x-0 px-6"}>
              <div className={"mt-9 text-[12px] text-white font-bold font-paperlogy"}>
                {ticket.paymentId}
              </div>
              <div className={"text-[26px] text-white font-bold"}>
                {ticket.lesson?.title}
              </div>
              <div className="mt-3 w-full h-[1px] bg-[#f7f8f9]"/>
              <div className="mt-3 grid gap-y-2">
                <div>
                  <p className="text-[#D9D9E3] font-medium text-[12px]">날짜</p>
                  <p className="text-white font-medium text-[18px]">{startTime.date}</p>
                </div>
                <div>
                  <p className="text-[#D9D9E3] font-medium text-[12px]">요일</p>
                  <p className="text-white font-medium text-[18px]">{startTime.dayOfWeek}요일</p>
                </div>
                <div>
                  <p className="text-[#D9D9E3] font-medium text-[12px]">시작</p>
                  <p className="text-white font-medium text-[18px]">{startTime.time}</p>
                </div>
                <div>
                  <p className="text-[#D9D9E3] font-medium text-[12px]">수업시간</p>
                  <p className="text-white font-medium text-[18px]">{ticket.lesson?.duration}분</p>
                </div>
                <div>
                  <p className="text-[#D9D9E3] font-medium text-[12px]">주관</p>
                  <p className="text-white font-medium text-[18px]">{ticket.lesson?.studio?.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#D9D9E3] font-medium text-[12px]">강의실</p>
                  <p className="text-white font-medium text-[18px]">{ticket.lesson?.room?.name}</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-4 top-0 w-8 h-8 bg-white rounded-full -translate-y-1/2"/>
            <div className="absolute -left-4 top-0 w-8 h-8 bg-white rounded-full -translate-y-1/2"/>
            <div className={"absolute right-0 bottom-0 text-red-400"}>
              {ticket.status == 'Paid' && <div>
                <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0 m-6">
                  <Image
                    src={ticket.lesson?.studio?.profileImageUrl ?? ''}
                    alt="studio logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>}
              {ticket.status == 'Cancelled' && <div>
                <div className="overflow-hidden flex-shrink-0">
                  <StampCancel className="scale-75"/> {/* 75% 크기로 */}
                </div>
              </div>}
              {ticket.status == 'Used' && <div>
                <div className="w-[160px] h-[160px] overflow-hidden flex-shrink-0 m-6">
                  <StampUsed className={"scale-75"}/>
                </div>
              </div>}
              {ticket.status == 'Pending' && <div>
                <div className="overflow-hidden flex-shrink-0">
                  <StampNotPaid className="scale-75"/>
                </div>
              </div>}
            </div>
          </div>
        </div>
        {ticket.status === 'Paid' &&
          <div className="absolute bottom-0 w-full overflow-hidden bg-black py-1">
            <div className="flex animate-scroll-reverse">
              <div className="flex shrink-0">
                {Array(2)
                  .fill(null)
                  .map((_, index) => (
                    <div key={index} className="flex">
                      {Array(50).fill(null).map((_, i) => (
                        <div key={`logo-${index}-${i}`}>
                          <Logo className={"scale-50"}/>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        }
        {/* 결제 완료 팝업 */}
        <div className={"z-10"}>
          {(await searchParams).isJustPaid === "true" && (
            <PaymentQuestionPopup title={ticket.lesson?.title ?? ''} lessonId={ticket.lesson?.id ?? 0}
                                  studioId={ticket.lesson?.studio?.id ?? 0}/>
          )}
        </div>
      </div>

    );
  } else {
    return <Loading/>;
  }
}

