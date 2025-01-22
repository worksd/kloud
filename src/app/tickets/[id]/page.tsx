import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Logo from "../../../../public/assets/logo_white.svg"
import { Thumbnail } from "@/app/components/Thumbnail";
import { api } from "@/app/api.client";
import Loading from "@/app/loading";
import { formatDateTime } from "@/utils/date.format";

export default async function TicketDetail({params}: { params: Promise<{ id: number }> }) {
  const ticket = await api.ticket.get({id: (await params).id});
  if ('id' in ticket) {
    const startTime = formatDateTime(ticket.lesson?.startTime ?? '');
    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <div className="w-full bg-black">
          <div className="flex justify-between items-center mb-14">
            <SimpleHeader title="레슨 수강권"/>
          </div>
          <div className="relative w-full overflow-hidden bg-black py-2">
            <div className="flex animate-infinite-scroll whitespace-nowrap">
              <div className="flex shrink-0">
                {Array(100).fill('rawgraphy').map((text, i) => (
                  <span key={`a-${i}`} className="inline-block px-4 font-bold">
                  <div>
                    <Logo/>
                  </div>
                </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col px-6 justify-center items-center mt-6">
          {/* Image */}
          <div style={{width: '263px', height: '350px', position: 'relative'}}>
            <Thumbnail width={263} url={ticket.lesson?.thumbnailUrl ?? ''}
            />
          </div>

          {/* Class Info */}
          <div className="w-screen flex flex-col items-center text-center px-6">
            <div className="w-full">
              <div className="font-bold text-[16px] text-black mt-10">
                {ticket.lesson?.title ?? ''}
              </div>
              <div className="flex items-center justify-center mt-2">
                <span className="text-[#86898C]">{ticket.lesson?.studio?.name} / {ticket.lesson?.room?.name ?? ''}</span>
              </div>

              <p className="text-[#86898C] mt-2 font-semibold">
                {startTime.date} {startTime.time} / {ticket.lesson?.duration}분
              </p>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="flex flex-col mt-12 justify-center items-center">
            <h2 className="text-xl font-bold mb-2 text-black">{ticket.user?.name ?? ''}</h2>
            <p className="text-[#86898C]">{ticket.user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    );
  } else {
    return <Loading/>;
  }
}

