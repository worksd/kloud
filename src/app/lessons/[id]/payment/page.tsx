import DropdownDetails from "@/app/components/DropdownDetail";
import { redirect } from "next/navigation";
import PaymentButton from "./payment.button";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { Thumbnail } from "@/app/components/Thumbnail";

function SellerInfoItem ({label, value}: {label: string; value: string;}) {
    return <div className="self-stretch justify-start items-start inline-flex">
    <div className="w-[120px] text-[#86898c] text-xs font-medium font-['Pretendard'] leading-none">{label}</div>
    <div className="grow shrink basis-0 text-black text-xs font-medium font-['Pretendard'] leading-none">
        {value}
    </div>
</div>
}

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

        if (searchParams.code == null && searchParams.paymentId != null && searchParams.transactionType != null) {
            // 정상결제 된 것.
            // TODO: 결제 API 호출해야함. 현재는 API가 없어서 스킵
            redirect("/");
        }
    }

    return (
      <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
          {/* 백 헤더 */}
          <div className="flex justify-between items-center mb-14 px-6">
              <SimpleHeader title=""/>
          </div>

          <div className="flex flex-col">
              {/* 수업 정보 */}
              <div className="flex gap-7 w-full px-6">
                  <Thumbnail url={dummyData.thumbnailUrl} width={86}
                             className="rounded-lg flex-shrink-0"/>

                  <div className="flex flex-col gap-2 min-w-0">
                      <p className="text-base font-bold text-left text-[#131517] break-words">{dummyData.title}</p>
                      <p className="text-sm font-bold text-left text-[#505356] break-words">
                          {dummyData.startTime} ({dummyData.duration}분간)
                      </p>
                      <p className="text-sm font-medium text-left text-[#505356] break-words">
                          {dummyData.studio.name} / {dummyData.room.name}
                      </p>
                  </div>
              </div>

              <div className="py-5">
                  <div className="w-full h-3 bg-[#F7F8F9] "/>
              </div>

              {/* 결제 수단 */}
              <div className="flex flex-col gap-y-4 px-6">
                  <p className="text-base font-bold text-left text-black">결제 수단</p>
                  <div
                    className="w-full flex justify-start items-center flex-grow-0 flex-shrink-0 h-[52px] relative gap-2 pl-4 pr-2 py-2 rounded-lg border border-black">
                      <svg
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
                        preserveAspectRatio="xMidYMid meet"
                      >
                          <g clipPath="url(#clip0_2251_9815)">
                              <path
                                d="M23.9873 11.4567C23.6869 4.8371 18.0787 -0.288904 11.4562 0.0126515C4.83377 0.314207 -0.288896 5.91999 0.0126592 12.5415C0.314215 19.1631 5.92177 24.2853 12.5429 23.9875C19.164 23.6898 24.2889 18.0764 23.9873 11.4567ZM18.8095 13.9413C18.1004 14.8322 16.7489 15.2062 15.7744 15.2422C15.7855 15.3722 15.7355 15.4867 15.6929 15.5053C15.6007 15.5447 15.5478 15.5595 15.4662 15.6449C15.4533 15.6562 15.4377 15.6641 15.4209 15.6677C15.4041 15.6713 15.3866 15.6706 15.3702 15.6655C13.832 15.2282 10.8813 13.1133 10.0951 12.6751C10.0835 13.6449 10.1575 15.2442 10.2233 16.2493C10.2487 16.6578 10.276 16.8675 10.2333 17.0898C10.2329 17.0956 10.2302 17.1011 10.2258 17.105C10.2214 17.1088 10.2156 17.1108 10.2098 17.1104C10.0202 17.1327 9.73088 17.0187 9.64733 16.9615C9.63649 16.9549 9.6273 16.9458 9.62044 16.9351C9.49888 16.6653 9.34488 15.8047 9.1971 15.5878C9.19351 15.5825 9.19136 15.5764 9.19088 15.57C9.00466 14.6091 8.95088 13.3995 8.93599 12.3407L8.93977 12.1682L8.69977 12.3015C8.55209 12.3718 8.41133 12.4557 8.27933 12.5522C8.19999 12.6131 8.12044 12.6769 8.03488 12.6769C8.03052 12.6766 8.02622 12.6781 8.02288 12.6809C7.8451 12.7849 6.3631 13.6931 5.88733 13.9049C5.47021 14.0875 5.23666 14.1773 5.10466 14.1715C5.0776 14.1729 5.05051 14.1698 5.02444 14.1624C4.95333 14.1344 4.92844 14.0624 4.82621 14.0338C4.80933 14.0284 4.79444 14.016 4.80555 13.9929C4.86177 13.8711 5.0071 13.7649 5.16888 13.6973C5.34903 13.6223 5.52525 13.5382 5.69688 13.4453C6.33333 13.0202 7.66199 12.1555 8.33333 11.6889C8.35066 11.6744 8.35866 11.6567 8.34199 11.6409C8.30555 11.6082 8.2791 11.5995 8.15288 11.5242C8.09851 11.4976 8.04965 11.461 8.00888 11.4162C8.00464 11.4095 7.99904 11.4037 7.99244 11.3993C7.72577 11.2295 7.08133 10.9055 6.44688 10.5638C5.89821 10.2695 5.38466 9.91488 5.18977 9.71421C5.18725 9.71183 5.1854 9.70884 5.18439 9.70553C5.18337 9.70222 5.18324 9.6987 5.18399 9.69532C5.19177 9.63154 5.12733 9.52843 5.15866 9.48043C5.25555 9.3291 5.6051 9.09554 5.7731 9.06665C5.78552 9.0646 5.79822 9.06503 5.81047 9.06793C5.82271 9.07083 5.83426 9.07614 5.84444 9.08354C6.05421 9.20487 6.39021 9.44243 6.5611 9.54576C6.71666 9.63776 6.88177 9.74332 7.02577 9.7611C7.03581 9.76256 7.04565 9.76517 7.0551 9.76888C7.70719 10.0817 8.33982 10.4335 8.94955 10.8224C8.95777 10.8278 8.95777 10.8191 8.95777 10.8149C9.0231 9.58732 9.3591 8.00443 9.73155 7.07954C9.73504 7.07108 9.74062 7.06364 9.74777 7.05792C9.75492 7.05221 9.76341 7.04841 9.77244 7.04687C9.92688 7.00976 10.0469 6.93199 10.1453 6.90954C10.2438 6.8871 10.3493 6.86199 10.4813 6.92865C10.4853 6.93085 10.4889 6.93379 10.4918 6.93732C10.514 6.96132 10.5524 7.0751 10.6158 7.1711C10.6292 7.19271 10.6339 7.21858 10.6291 7.24354C10.4358 8.25021 10.2604 9.55465 10.2124 10.4707C10.2124 10.473 10.213 10.4753 10.2142 10.4773C10.2154 10.4793 10.2171 10.4809 10.2192 10.4819C10.2213 10.4829 10.2237 10.4833 10.226 10.483C10.2283 10.4827 10.2304 10.4817 10.2322 10.4802C11.01 9.9791 12.6418 8.96621 13.3307 8.5751C13.4909 8.48399 13.6358 8.4211 13.8162 8.25199C14.424 7.68243 15.0778 7.38332 15.5693 7.43132C15.5779 7.43454 15.5857 7.43973 15.5919 7.44649C15.5982 7.45324 15.6028 7.46136 15.6053 7.47021C15.6383 7.58696 15.6349 7.711 15.5955 7.82576C15.5847 7.8632 15.579 7.90191 15.5784 7.94087C15.5809 7.96037 15.5762 7.9801 15.5653 7.99643C14.6444 8.95132 12.5358 9.93776 11.3358 10.6667C11.3039 10.6834 11.274 10.7038 11.2469 10.7275C11.1802 10.8302 10.3802 11.2675 10.1909 11.3942C10.181 11.3988 10.1721 11.4055 10.1649 11.4138C10.1577 11.422 10.1523 11.4317 10.1491 11.4422C10.1382 11.4791 10.1357 11.518 10.1418 11.556C10.1418 11.5635 10.1418 11.5673 10.1458 11.5709C10.6858 11.9342 11.5953 12.5264 12.0204 12.8691C12.1315 12.958 12.3775 13.174 12.5178 13.2282C13.3938 13.5593 14.3922 14.3913 14.9878 14.7502C15.5984 14.7724 16.1878 14.7253 16.7749 14.5027C17.3327 14.2913 17.7455 13.9553 17.95 13.5713C18.2331 13.0404 18.162 12.5509 18.1027 12.4858C17.8751 12.2364 17.5458 12.0622 17.0467 12.1404C16.2627 12.2615 15.6411 13.054 15.4911 13.6631C15.4822 13.7379 15.48 13.8134 15.4844 13.8887C15.4869 13.9204 15.4762 13.9535 15.4493 13.9535C15.4149 13.9549 15.3809 13.9607 15.348 13.9709C15.086 14.0695 14.7813 14.1324 14.7049 14.1042C14.5938 14.064 14.5004 13.9669 14.4975 13.944C14.416 13.2551 14.4131 12.4395 14.5038 11.4795C14.508 11.4469 14.5038 11.4322 14.5178 11.4178C14.5955 11.3409 14.6411 10.5431 14.6435 10.39C14.6429 10.3767 14.6454 10.3634 14.6508 10.3513C14.6562 10.3391 14.6644 10.3284 14.6747 10.32C14.7611 10.2447 15.1604 10.1007 15.3658 10.0978C15.3758 10.0963 15.3861 10.0984 15.3948 10.1036C15.4036 10.1088 15.4103 10.1169 15.4138 10.1264C15.6438 10.666 15.3811 11.4998 15.4182 12.1564C15.4182 12.1593 15.4235 12.1593 15.4235 12.1593C15.8502 11.8895 16.4013 11.6024 17.0871 11.5618C17.7633 11.5213 18.3942 11.6458 18.8589 12.1084C18.9004 12.1498 18.9582 12.1644 18.9864 12.1895C19.29 12.4755 19.298 13.3284 18.81 13.9413H18.8095Z"
                                fill="#131517"
                              />
                          </g>
                          <defs>
                              {/*<clippath id="clip0_2251_9815">*/}
                              {/*    <rect width={24} height={24} rx={12} fill="white" />*/}
                              {/*</clippath>*/}
                          </defs>
                      </svg>
                      <p className="flex-grow w-[294px] text-sm font-medium text-left text-black">신용카드</p>
                  </div>
              </div>

              <div className="py-5">
                  <div className="w-full h-[1px] bg-[#F7F8F9] "/>
              </div>

              {/* 결제 정보 */}
              <div className="flex flex-col gap-y-4 px-6">
                  <p className="text-base font-bold text-left text-black">결제 정보</p>

                  <div className="flex flex-col gap-y-2">
                      <div className="flex justify-between text-sm font-medium text-center text-black">
                          <p>수강권 금액</p>
                          <p>{new Intl.NumberFormat("ko-KR").format(dummyData.price)}원</p>
                      </div>

                      <div className="flex justify-between text-[10px] font-medium text-center text-[#86898c]">
                          <p>1회 수업권</p>
                          <p>{new Intl.NumberFormat("ko-KR").format(dummyData.price)}원</p>
                      </div>
                  </div>

                  <div className="w-full h-px bg-[#35383b]"/>

                  <div className="flex justify-between text-base font-bold text-center text-black">
                      <p>총 결제 금액</p>
                      <p>{new Intl.NumberFormat("ko-KR").format(dummyData.price)}원</p>
                  </div>
              </div>

              <div className="py-5">
                  <div className="w-full h-3 bg-[#F7F8F9] "/>
              </div>

              <div className="flex flex-col gap-y-5 px-6">
                  {/* 판매자 정보 */}
                  <DropdownDetails title="판매자 정보">
                      <SellerInfoItem label="상호" value="입점사명"/>
                      <SellerInfoItem label="사업자번호" value="입점사명"/>
                      <SellerInfoItem label="통신판매업 신고번호" value="입점사명"/>
                      <SellerInfoItem label="대표자명" value="입점사명"/>
                      <SellerInfoItem label="사업자소재지" value="입점사명"/>
                  </DropdownDetails>

                  {/* 환불 안내 */}
                  <DropdownDetails title="환불 안내">
                      <div className="text-[#86898c] text-xs font-medium font-['Pretendard'] leading-none">
                          <p className="pb-4">학원법 제 00거에 의거하여 환불은 진행해드리고 있습니다.</p>
                          <p>다만, 입점사별로 환불정책이 다를 경우 입점사의 환불 정책에 따라 환불이 진행됩니다.</p>
                      </div>
                  </DropdownDetails>
              </div>

              <div
                className="w-[354px] mt-5 text-center text-[#6b6e71] text-[10px] font-medium font-['Pretendard'] leading-[14px]">
                  <p className="pb-4">본 주문 내용 및 약관 내용을 확인하였으며, 예약에 동의합니다.</p>
                  <p>로우그래피(주)는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.</p>
                  <p>상품, 상품 정보, 거래, 이용에 관한 의무와 책임은 판매자에게 있습니다.</p>
              </div>
          </div>

          <div className="left-0 w-full h-fit fixed bottom-2 px-6">
              <PaymentButton data={dummyData}/>
          </div>
      </div>
    );
}
