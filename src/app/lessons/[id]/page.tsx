import { CommonSubmitButton } from "@/app/components/buttons";
import Image from "next/image";
import Link from "next/link";
import Calendar from "../../../../public/assets/calendar.svg";

import { HeaderInDetail } from "@/app/components/headers";
import { calculateDDays } from "@/utils";
import { Metadata } from "next";
import Location from "../../../../public/assets/location.svg";
import TimeCircle from "../../../../public/assets/time-circle.svg";
import Users from "../../../../public/assets/users.svg";
import LessonInfoLabel from "./payment/lesson.info.label";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // const data = await api.lesson.get({id: Number(params.id)});

    // TODO: 데이터 연결시켜야 함.
    const data = {
        id: 3,
        code: "00008-241110-0001",
        title: "트릭스 팝핀 초급반",
        thumbnailUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
        startTime: "2024.12.02 19:30",
        duration: 60,
        type: "Regular",
        level: "Advanced",
        artist: {
            id: 3,
            name: "서종렬",
            nickName: "Trix",
            profileImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
            phone: "01072705880",
            instagramAddress: "@t_goddoro",
        },
        studio: {
            id: 3,
            name: "저스터절크 이대점",
            address: "서울 중구 필동2가 82-1",
            profileImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
            coverImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
            phone: "01072705880",
            youtubeUrl: "https://www.youtube.com/embed/asdflk",
            instagramAddress: "@t_goddoro",
            lessons: [
                {
                    id: 3,
                    thumbnailUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
                    title: "트릭스 팝핀 초급반",
                    startTime: "2022.03.03 19:30",
                    studio: {
                        id: 3,
                        name: "저스터절크 이대점",
                        profileImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
                    },
                },
            ],
        },
        currentStudentCount: 14,
        room: {
            id: 3,
            maxNumber: 30,
            name: "저스터절크 이대점",
        },
        ticket: {
            id: 3,
        },
    };

    return {
        title: data.title,
    };
}

function formatDateTime(input: string): { time: string; date: string } {
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

    const [datePart, timePart] = input.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const dateObj = new Date(year, month - 1, day, hour, minute);

    const hours = dateObj.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = hours % 12 || 12;
    const time = `${ampm} ${formattedHour}:${minute.toString().padStart(2, "0")}`;

    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    const date = `${year}.${month.toString().padStart(2, "0")}.${day.toString().padStart(2, "0")} (${dayOfWeek})`;

    return { time, date };
}

export default async function LessonDetail({ params }: Props) {
    const lessonId = (await params).id;

    // const data = await api.lesson.get({id: Number(params.id)});

    // TODO: 데이터 연결시켜야 함.
    const data = {
        id: 3,
        code: "00008-241110-0001",
        title: "트릭스 팝핀 초급반",
        thumbnailUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
        startTime: "2024.12.02 19:30",
        duration: 60,
        type: "Regular",
        level: "Advanced",
        artist: {
            id: 3,
            name: "서종렬",
            nickName: "Trix",
            profileImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
            phone: "01072705880",
            instagramAddress: "@t_goddoro",
        },
        studio: {
            id: 3,
            name: "저스터절크 이대점",
            address: "서울 중구 필동2가 82-1",
            profileImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
            coverImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
            phone: "01072705880",
            youtubeUrl: "https://www.youtube.com/embed/asdflk",
            instagramAddress: "@t_goddoro",
            lessons: [
                {
                    id: 3,
                    thumbnailUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
                    title: "트릭스 팝핀 초급반",
                    startTime: "2022.03.03 19:30",
                    studio: {
                        id: 3,
                        name: "저스터절크 이대점",
                        profileImageUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
                    },
                },
            ],
        },
        currentStudentCount: 14,
        room: {
            id: 3,
            maxNumber: 30,
            name: "저스터절크 이대점",
        },
        ticket: {
            id: 3,
        },
    };

    const startTime = formatDateTime(data.startTime);

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
                <div className="self-stretch h-[235px] flex-col justify-start items-start gap-4 flex">
                    {/* 수업명 */}
                    <div className="self-stretch h-[58px] px-6 flex-col justify-start items-start gap-2.5 flex">
                        <div className="self-stretch justify-between items-start inline-flex">
                            <Image
                                className="relative rounded-[20px] border border-[#f7f8f9]"
                                src={data.studio.profileImageUrl}
                                alt={`${data.studio.name} 스튜디오`}
                                width={24}
                                height={24}
                            />
                            <div className="justify-center items-start gap-[3px] flex">
                                <div className="self-stretch px-2 py-1 bg-black rounded-xl justify-center items-center gap-2.5 inline-flex">
                                    <div className="text-white text-xs font-medium leading-none">{data.level}</div>
                                </div>
                                <div className="self-stretch px-2 py-1 rounded-xl border border-[#d7dadd] justify-center items-center gap-2.5 inline-flex">
                                    <div className="text-[#86898c] text-xs font-medium leading-none">{data.type}</div>
                                </div>
                            </div>
                        </div>
                        <div className="self-stretch justify-start items-center gap-2 inline-flex">
                            <div className="w-[342px] text-black text-xl font-bold leading-normal">{data.title}</div>
                        </div>
                    </div>

                    {/* 상세 */}
                    <div className="self-stretch h-[161px] flex-col justify-start items-start flex">
                        <div className="self-stretch h-px px-6 flex-col justify-start items-start gap-2.5 flex">
                            <div className="h-px relative bg-[#f7f8f9]" />
                        </div>

                        <div className="self-stretch h-40 px-6 py-5 flex-col justify-start items-start gap-4 flex">
                            <div className="self-stretch h-[120px] flex-col justify-start items-start gap-2 flex">
                                <LessonInfoLabel iconPath={Location} text={data.studio.name} subText={data.room.name} />

                                <LessonInfoLabel iconPath={Calendar} text={startTime.date} subText={calculateDDays(data.startTime)} />

                                <LessonInfoLabel iconPath={TimeCircle} text={startTime.time} subText={`${data.duration}분`} />

                                <LessonInfoLabel iconPath={Users} text={data.currentStudentCount + ""} subText={data.room.maxNumber + ""} />
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
                {true && (
                    <Link href={`/lessons/${lessonId}/payment`}>
                        <CommonSubmitButton>30,000원 결제</CommonSubmitButton>
                    </Link>
                )}
            </div>
        </div>
    );
}
