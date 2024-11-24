import { redirect } from "next/navigation";
import DynamicLessonPaymentContent from "./dynamicContent";

export default function LessonPaymentPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
    const dummyData = {
        id: 3,
        code: "00008-241110-0001",
        title: "트릭스 팝핀 초급반",
        thumbnailUrl: "https://guinness.s3.ap-northeast-2.amazonaws.com/profile/1728490679606",
        startTime: "2022.03.03 19:30",
        duration: 60,
        type: "Regular",
        level: "Advanced",
        price: 1000,
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

    if (searchParams != null) {
        if (searchParams.code != null && searchParams.code.startsWith("FAILURE")) {
            // pass
        }
        
        if (searchParams.code == null && searchParams.paymentId != null && searchParams.transactionType != null)
        {
            // 정상결제 된 것.
            // TODO: 결제 API 호출해야함. 현재는 API가 없어서 스킵
            redirect("/");
        }
    }

    return (
        <div className="w-screen h-screen bg-white px-6 flex flex-col">
            {/* 백 헤더 (컴포넌트로 따로 빼네야 함) */}
            <div className="flex justify-between items-center w-screen h-14 relative">
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative overflow-hidden">
                    <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M18 12C18 12.1989 17.921 12.3896 17.7803 12.5303C17.6397 12.671 17.4489 12.75 17.25 12.75H8.5605L11.781 15.969C11.8507 16.0387 11.906 16.1215 11.9438 16.2126C11.9815 16.3037 12.0009 16.4014 12.0009 16.5C12.0009 16.5986 11.9815 16.6962 11.9438 16.7873C11.906 16.8785 11.8507 16.9612 11.781 17.031C11.7113 17.1007 11.6285 17.156 11.5374 17.1938C11.4463 17.2315 11.3486 17.2509 11.25 17.2509C11.1514 17.2509 11.0537 17.2315 10.9626 17.1938C10.8715 17.156 10.7887 17.1007 10.719 17.031L6.219 12.531C6.14915 12.4613 6.09374 12.3785 6.05593 12.2874C6.01812 12.1963 5.99866 12.0986 5.99866 12C5.99866 11.9013 6.01812 11.8036 6.05593 11.7125C6.09374 11.6214 6.14915 11.5386 6.219 11.469L10.719 6.96897C10.8598 6.82814 11.0508 6.74902 11.25 6.74902C11.4492 6.74902 11.6402 6.82814 11.781 6.96897C11.9218 7.1098 12.0009 7.30081 12.0009 7.49997C12.0009 7.69913 11.9218 7.89014 11.781 8.03097L8.5605 11.25H17.25C17.4489 11.25 17.6397 11.329 17.7803 11.4696C17.921 11.6103 18 11.8011 18 12Z"
                            fill="black"
                        />
                    </svg>
                </div>
                <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-center text-black"> </p>
                <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 overflow-hidden" />
            </div>

            <DynamicLessonPaymentContent data={dummyData} />
        </div>
    );
}
