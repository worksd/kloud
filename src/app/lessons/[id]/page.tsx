import Image from "next/image";
import { HeaderInDetail } from "@/app/components/headers";
import { Metadata } from "next";
import { api } from "@/app/api.client";
import { isGuinnessErrorCase } from "@/app/guinnessErrorCase";
import { LessonTypesDisplay } from "@/entities/lesson/lesson";
import LessonInfoSection from "./lesson.info.section";
import LessonPaymentButton from "./lesson.payment.button";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await api.lesson.get({ id: Number((await params).id) });
    if (isGuinnessErrorCase(data)) {
        return {
            title: 'no data'
        }
    } else {
        return {
            title: data.title,
        };
    }
}

export default async function LessonDetail({ params }: Props) {
    const id = Number((await params).id);

    const data = await api.lesson.get({ id });
    if (isGuinnessErrorCase(data)) {
       return (
         <div>{data.code} {data.message}</div>
       )
    }

    return (
        <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto font-['Pretendard']">
            {/* 헤더 */}
            <HeaderInDetail title={data.title} />

            {/* 수업 썸네일 */}
            <div
                style={{ backgroundImage: `url(${data.thumbnailUrl})` }}
                className="
            w-full
            relative
            aspect-[3/2]
            
            bg-cover
            bg-center
            bg-no-repeat

            before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-transparent
            before:from-70%
            before:to-white
            before:to-100%
            before:z-[2]"
            />

            {/* 디테일 영역 */}
            <div className="w-full py-5 flex-col justify-start items-start gap-8 inline-flex">
                <div className="self-stretch flex-col justify-start items-start gap-0 flex">
                    {/* 수업명 */}
                    <div className="self-stretch px-6 flex-col justify-start items-start gap-2.5 flex">
                        <div className="self-stretch justify-between items-start inline-flex">
                            <Image
                              className="relative rounded-[20px] border border-[#f7f8f9] w-6 h-6 box-border object-cover object-center"
                              src={data.studio.profileImageUrl}
                              alt={`${data.studio.name} 스튜디오`}
                              width={24}
                              height={24}
                            />
                            <div className="justify-center items-start gap-[3px] flex">
                                <div
                                  className="self-stretch px-2 py-1 bg-black rounded-xl justify-center items-center gap-2.5 inline-flex">
                                    <div className="text-white text-xs font-medium leading-none">{data.level}</div>
                                </div>
                                <div
                                  className="self-stretch px-2 py-1 rounded-xl border border-[#d7dadd] justify-center items-center gap-2.5 inline-flex">
                                    <div
                                      className="text-[#86898c] text-xs font-medium leading-none">{LessonTypesDisplay[data.type]}</div>
                                </div>
                            </div>
                        </div>
                        <div className="self-stretch justify-start items-center gap-2 inline-flex">
                            <div className="w-[342px] text-black text-xl font-bold leading-normal">{data.title}</div>
                        </div>
                        <div className="w-full h-[1px] bg-[#f7f8f9]"/>
                    </div>


                    {/* 상세 */}
                    <LessonInfoSection data={data}/>

                    <div className="w-full h-3 bg-[#f7f8f9]"/>
                </div>

                {/* 강사 */}
                <div className="self-stretch flex-col justify-start items-start gap-5 flex">
                    <div className="self-stretch h-7 px-6 justify-center items-center gap-2.5 inline-flex">
                        <div className="grow shrink basis-0 text-black text-base font-medium leading-snug">강의정보</div>
                    </div>
                    <div className="self-stretch h-9 px-6 flex-col justify-start items-start gap-4 flex">
                        <div className="self-stretch justify-start items-center gap-3 inline-flex">
                            <Image
                                className="rounded-[20px]"
                                src={data.artist.profileImageUrl}
                                alt={`${data.artist.nickName} 강사`}
                                width={36}
                                height={36}
                            />

                            <div className="text-black text-sm font-bold leading-tight">{data.artist.nickName}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 결제 페이지 이동 버튼 */}
            <div className="left-0 w-full h-fit fixed bottom-2 px-6">
                <LessonPaymentButton id={id} ticketData={data.ticket} />
            </div>
        </div>
    );
}
