import { api } from "@/app/api.client";
import SnsButton from "@/app/components/buttons/SnsButton";
import { HeaderInDetail } from "@/app/components/headers";
import { extractNumber } from "@/utils";
import Image from "next/image";

import Instagram from "../../../../public/assets/instagram-colored.svg";
import Youtube from "../../../../public/assets/youtube-colored.svg";

import EmailMark from "../../../../public/assets/email.svg";
import KakaoMark from "../../../../public/assets/kakao-gray.svg";
import LocationMark from "../../../../public/assets/location.svg";
import PhoneMark from "../../../../public/assets/phone.svg";
import StudioContact from "./studio.contact";
import Divider from "./studio.divider";
import LessonCardInStudio from "./studio.lesson";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StudioDetail({ params }: Props) {
    const id = (await params).id;
    const res = await api.studio.get({ id: extractNumber(id) });
    if ("code" in res) {
        console.error(res.message);
        return <>에러~</>;
    }

    const [address, _] = res.address.split("/");

    return (
        <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-auto font-['Pretendard']">
            {/* 헤더 */}
            <HeaderInDetail title={res.name} />

            {/* 수업 썸네일 */}
            <div
                style={{ backgroundImage: `url(${res.coverImageUrl ?? res.profileImageUrl})` }}
                className="
            w-full
            relative
            aspect-[1/1]
            
            bg-cover
            bg-center
            bg-no-repeat

            before:content-['']
            before:absolute
            before:inset-0
            before:block
            before:bg-gradient-to-b
            before:from-transparent
            before:from-[65%]
            before:to-white
            before:to-100%
            before:z-[2]"
            >
                {/* 프로필 영역 */}
                <div className="w-full pl-6 box-border items-center gap-3 inline-flex absolute bottom-0 z-20">
                    <Image
                        className="w-[60px] h-[60px] relative rounded-[30px] border border-[#f7f8f9]"
                        src={res.profileImageUrl}
                        width={60}
                        height={60}
                        alt=" 스튜디오"
                    />

                    <div className="flex-col justify-center items-start gap-2 inline-flex">
                        <div className="text-[#131517] text-xl font-bold leading-normal">{res.name}</div>

                        <button className="px-2.5 py-1 bg-black rounded-[999px] justify-center items-center gap-2.5 inline-flex">
                            <div className="text-center text-white text-sm font-medium leading-tight">팔로우</div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 상세 영역 */}
            <div className="w-full flex flex-col justify-start items-start gap-5 pt-3">
                <div className="self-stretch px-6 py-0.5 box-border justify-between items-center flex">
                    <div className="justify-start items-center gap-1 flex">
                        <Image src={LocationMark} alt="장소" width={20} height={20} />

                        <div className="text-center text-[#505356] text-sm font-medium underline leading-tight">{address}</div>
                    </div>
                    <div className="text-center text-black text-sm font-medium leading-tight">길 찾기</div>
                </div>

                <div className="self-stretch px-6 justify-start items-center gap-2 inline-flex">
                    {res.instagramAddress && <SnsButton link={res.instagramAddress} logoPath={Instagram} alt="instagram" />}
                    {res.youtubeUrl && <SnsButton link={res.youtubeUrl} logoPath={Youtube} alt="youtube" />}
                </div>

                <div className="w-full h-px relative bg-[#f7f8f9]" />

                {/* 공지 */}
                {/* <div className="self-stretch px-6 justify-start items-start gap-2 inline-flex">
                    <div className="w-[342px] px-5 py-4 bg-[#f7f8f9] rounded-2xl flex-col justify-start items-start gap-2 inline-flex">
                        <div className="self-stretch h-6 justify-between items-center inline-flex">
                            <div className="justify-start items-center gap-2 flex">
                                <Image
                                    src={res.profileImageUrl}
                                    className="w-6 h-6 relative rounded-[20px] border border-[#f7f8f9]"
                                    width={24}
                                    height={24}
                                    alt="스튜디오 썸네일"
                                />
                                <div className="text-black text-sm font-bold leading-tight">{res.name}</div>
                            </div>

                            <Image src={Chevron} alt="더보기" width={20} height={20} className="relative origin-top-left rotate-90" />
                        </div>
                        <div className="self-stretch text-[#35383b] text-sm font-medium leading-tight">
                            쿠폰에 유효기간이 남아있는 분들은 월-금 14:00-23:00까지 언제든지 연습실 사용이 가능합니다. (토요일은 상황에 따라
                            가능한 시간이 변동됩니다.)
                        </div>
                    </div>
                </div> */}

                <Divider />
            </div>

            {/* 더보기 영역 */}
            {res.lessons.length > 0 && (
                <div className="px-6 w-full box-border pb-8">
                    <p className="text-black text-2xl font-medium leading-7 pt-10 pb-5">Hot</p>

                    <div className="h-[660px] w-full flex-col justify-start items-start gap-5 inline-flex">
                        <div className="self-stretch justify-start items-center gap-x-[calc(100%/42.75)] gap-y-5 inline-flex flex-wrap">
                            {res.lessons.splice(0, 4).map((data) => (
                                <LessonCardInStudio key={data.id} {...data} />
                            ))}
                        </div>

                        <button className="self-stretch h-14 px-4 rounded-lg border border-[#bcbfc2] justify-center items-center inline-flex">
                            <div className="text-center text-black text-base font-bold leading-snug">더보기</div>
                        </button>
                    </div>
                </div>
            )}

            <Divider />

            <div className="w-full flex-col justify-start items-start gap-5 inline-flex pt-10">
                <div className="self-stretch h-7 px-6 justify-center items-center gap-2.5 inline-flex">
                    <div className="grow shrink basis-0 text-[#131517] text-base font-medium leading-snug">Contact</div>
                </div>
                <div className="self-stretch px-6 justify-start items-center gap-5 inline-flex">
                    <StudioContact imgPath={EmailMark} text="이메일"/>
                    <StudioContact imgPath={PhoneMark} text="전화"/>
                    <StudioContact imgPath={KakaoMark} text="카카오톡"/>
                </div>
            </div>
        </div>
    );
}
