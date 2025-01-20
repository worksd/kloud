import DropdownDetails from "@/app/components/DropdownDetail";
import { notFound, redirect } from "next/navigation";
import PaymentButton from "./payment.button";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { Thumbnail } from "@/app/components/Thumbnail";
import { getPaymentDetail } from "@/app/lessons/[id]/payment/payment.detail.action";

function SellerInfoItem ({label, value}: {label: string; value: string;}) {
    return <div className="self-stretch justify-start items-start inline-flex">
    <div className="w-[120px] text-[#86898c] text-xs font-medium font-['Pretendard'] leading-none">{label}</div>
    <div className="grow shrink basis-0 text-black text-xs font-medium font-['Pretendard'] leading-none">
        {value}
    </div>
</div>
}

export default async function LessonPaymentPage() {


    const lesson = await getPaymentDetail({id: 1})

    if ('id' in lesson) {
        return (
          <div className="w-full h-screen bg-white flex flex-col pb-20 box-border overflow-y-auto scrollbar-hide">
              {/* 백 헤더 */}
              <div className="flex justify-between items-center mb-14 px-6">
                  <SimpleHeader title="결제하기"/>
              </div>

              <div className="flex flex-col">
                  {/* 수업 정보 */}
                  <div className="flex gap-7 w-full px-6">
                      <Thumbnail url={lesson.thumbnailUrl} width={86}
                                 className="rounded-lg flex-shrink-0"/>

                      <div className="flex flex-col gap-2 min-w-0">
                          <p className="text-base font-bold text-left text-[#131517] break-words">{lesson.title}</p>
                          <p className="text-sm font-bold text-left text-[#505356] break-words">
                              {lesson.startTime} ({lesson.duration}분간)
                          </p>
                          <p className="text-sm font-medium text-left text-[#505356] break-words">
                              {lesson.studio.name} / {lesson.room.name}
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
                              <p>{new Intl.NumberFormat("ko-KR").format(lesson.price)}원</p>
                          </div>

                          <div className="flex justify-between text-[10px] font-medium text-center text-[#86898c]">
                              <p>1회 수업권</p>
                              <p>{new Intl.NumberFormat("ko-KR").format(lesson.price)}원</p>
                          </div>
                      </div>

                      <div className="w-full h-px bg-[#35383b]"/>

                      <div className="flex justify-between text-base font-bold text-center text-black">
                          <p>총 결제 금액</p>
                          <p>{new Intl.NumberFormat("ko-KR").format(lesson.price)}원</p>
                      </div>
                  </div>

                  <div className="py-5">
                      <div className="w-full h-3 bg-[#F7F8F9] "/>
                  </div>

                  <div className="flex flex-col gap-y-5 px-6">
                      {/* 판매자 정보 */}
                      <DropdownDetails title="판매자 정보">
                          <SellerInfoItem label="사업자명" value={lesson.studio.name}/>
                          { lesson.studio.businessRegistrationNumber && <SellerInfoItem label="사업자번호" value={lesson.studio.businessRegistrationNumber}/> }
                          { lesson.studio.eCommerceRegNumber && <SellerInfoItem label="통신판매업 신고번호" value={lesson.studio.eCommerceRegNumber}/> }
                          { lesson.studio.representative && <SellerInfoItem label="대표자명" value={lesson.studio.representative}/> }
                          { lesson.studio.educationOfficeRegNumber && <SellerInfoItem label="교육청 등록번호" value={lesson.studio.educationOfficeRegNumber}/> }
                          { lesson.studio.address && <SellerInfoItem label={"사업자소재지"} value={lesson.studio.address}/> }
                      </DropdownDetails>

                      {/* 환불 안내 */}
                      <DropdownDetails title="환불 안내">
                          <div className="text-[#86898c] text-xs font-medium font-['Pretendard'] leading-none">
                              <p className="pb-4">수강료 환불은 학원의 설립 및 과외교습에 관한 법률 시행령 제18조 제3항 별표 4에 의거 진행됩니다.</p>
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
                  <PaymentButton lessonId={lesson.studio.id} price={lesson.price} title={lesson.title}/>
              </div>
          </div>
        );
    } else {
        return notFound()
    }
}
