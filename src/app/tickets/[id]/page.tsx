import Image from "next/image";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Logo from "../../../../public/assets/logo_white.svg"
import { Thumbnail } from "@/app/components/Thumbnail";

export type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TicketDetail({params}: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="w-full bg-black">
        <div className="flex justify-between items-center mb-14">
          <SimpleHeader title=""/>
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
          <Thumbnail width={263}
          />
        </div>

        {/* Class Info */}
        <div className="w-screen flex flex-col items-center text-center px-6">
          <div className="w-full">
            <div className="font-bold text-[16px] text-black mt-10">
              트릭스 힙합 클래스 초보반
            </div>
            <div className="flex items-center justify-center mt-2">
              <span className="text-[#86898C]">원밀리언 댄스 스튜디오 / A홀</span>
            </div>

            <p className="text-[#86898C] mt-2 font-semibold">
              2024.10.22 (금) 17:00 /80분
            </p>
          </div>
        </div>

        {/* Instructor Info */}
        <div className="flex flex-col mt-12 justify-center items-center">
          <h2 className="text-xl font-bold mb-2 text-black">서종렬</h2>
          <p className="text-[#86898C]">jongryeol.seo@worksd.kr</p>
        </div>
      </div>
    </div>
  );
}

