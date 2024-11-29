import { CommonSubmitButton, HeaderBlurButton } from "@/app/components/buttons";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import Calendar from "../../../../public/assets/calendar.svg";
import LeftArrow from "../../../../public/assets/left-arrow.svg";
import Location from "../../../../public/assets/location.svg";
import ShareArrow from "../../../../public/assets/share-arrow.svg";
import TimeCircle from "../../../../public/assets/time-circle.svg";
import Users from "../../../../public/assets/users.svg";
import LessonInfoLabel from "./payment/lesson.info.label";

export default function LessonDetail({ params }: { params: { id: string } }) {
    const isPaymentButtonVisible = useMemo(() => true, []);

    return (
        <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto font-['Pretendard']">
            {/* 헤더 */}
            <div className="w-full h-14 px-6 justify-between items-center inline-flex fixed top-0 left-0 z-10">
                <HeaderBlurButton>
                    <Image src={LeftArrow} alt="back icon" />
                </HeaderBlurButton>

                <HeaderBlurButton>
                    <div className="w-6 h-6 pl-[2.50px] pr-[2.52px] py-[2.10px] justify-center items-center flex">
                        <Image src={ShareArrow} alt="share icon" />
                    </div>
                </HeaderBlurButton>
            </div>

            {/* 수업 썸네일 */}
            <div
                className="
            w-full
            relative
            aspect-[3/2]

            bg-[url('https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606')]
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
                <div className="self-stretch h-[235px] flex-col justify-start items-start gap-4 flex">
                    {/* 수업명 */}
                    <div className="self-stretch h-[58px] px-6 flex-col justify-start items-start gap-2.5 flex">
                        <div className="self-stretch justify-between items-start inline-flex">
                            <Image
                                className="relative rounded-[20px] border border-[#f7f8f9]"
                                src="https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606"
                                alt={`${"aa"} 스튜디오`}
                                width={24}
                                height={24}
                            />
                            <div className="justify-center items-start gap-[3px] flex">
                                <div className="self-stretch px-2 py-1 bg-black rounded-xl justify-center items-center gap-2.5 inline-flex">
                                    <div className="text-white text-xs font-medium leading-none">Beginner</div>
                                </div>
                                <div className="self-stretch px-2 py-1 rounded-xl border border-[#d7dadd] justify-center items-center gap-2.5 inline-flex">
                                    <div className="text-[#86898c] text-xs font-medium leading-none">정규</div>
                                </div>
                            </div>
                        </div>
                        <div className="self-stretch justify-start items-center gap-2 inline-flex">
                            <div className="w-[342px] text-black text-xl font-bold leading-normal">트릭스 힙합 클래스 초보반 </div>
                        </div>
                    </div>

                    {/* 상세 */}
                    <div className="self-stretch h-[161px] flex-col justify-start items-start flex">
                        <div className="self-stretch h-px px-6 flex-col justify-start items-start gap-2.5 flex">
                            <div className="h-px relative bg-[#f7f8f9]" />
                        </div>

                        <div className="self-stretch h-40 px-6 py-5 flex-col justify-start items-start gap-4 flex">
                            <div className="self-stretch h-[120px] flex-col justify-start items-start gap-2 flex">
                                <LessonInfoLabel iconPath={Location} text="원밀리언 댄스 스튜디오" subText="A홀" />

                                <LessonInfoLabel iconPath={Calendar} text={"2024.12.22 (금)"} subText=" D-9" />

                                <LessonInfoLabel iconPath={TimeCircle} text="PM 7:00" subText="60분" />

                                <LessonInfoLabel iconPath={Users} text={"29"} subText="30" />
                            </div>
                        </div>
                    </div>
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
                                src="https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606"
                                alt={`${"aa"} 강사`}
                                width={36}
                                height={36}
                            />

                            <div className="text-black text-sm font-bold leading-tight">커스틴</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 결제 페이지 이동 버튼 */}
            <div className="left-0 w-full h-fit fixed bottom-2 px-6">
                {isPaymentButtonVisible && (
                    <Link href={`/lessons/${params.id}/payment`}>
                        <CommonSubmitButton>30,000d원 결제</CommonSubmitButton>
                    </Link>
                )}
            </div>
        </div>
    );
}
