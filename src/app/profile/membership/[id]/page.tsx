import { getMembershipAction } from "@/app/profile/membership/[id]/action/get.membership.action";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { MembershipItem } from "@/app/profile/membership/[id]/MembershipItem";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import Divider from "@/app/studios/[id]/studio.divider";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { getLocale, translate } from "@/utils/translate";
import { getLocaleString } from "@/app/components/locale";
import Image from "next/image";

export default async function MembershipDetailPage({params}: {
  params: Promise<{ id: number }>
}) {
  const membership = await getMembershipAction({id: (await params).id});
  if ('id' in membership) {
    const locale = await getLocale();
    
    // 할인 정보 구성
    const discounts = [];
    if (membership.plan.discountAmount && membership.plan.discountAmount > 0) {
      discounts.push({
        key: membership.plan.name,
        value: new Intl.NumberFormat("ko-KR").format(membership.plan.discountAmount),
        type: "membership",
        itemId: membership.plan.id
      });
    }

    // 원래 가격 계산 (할인 금액이 있으면 원래 가격 = 현재 가격 + 할인 금액)
    const originalPrice = membership.plan.discountAmount && membership.plan.discountAmount > 0
      ? membership.plan.price + membership.plan.discountAmount
      : membership.plan.price;

    return (
      <div className={"flex flex-col min-h-screen"}>
        <SimpleHeader titleResource={'my_membership'} />

        <div className={'flex flex-col px-4'}>
          {/* 이미지 카드 */}
          {membership.plan.imageUrl && (
            <div className="relative w-full h-[200px] rounded-[16px] overflow-hidden mt-5 mb-4">
              <Image
                src={membership.plan.imageUrl}
                alt={membership.plan.name}
                fill
                className="object-cover"
                quality={60}
              />
            </div>
          )}

          <div className={'mt-5'}>
            <MembershipItem membership={membership} locale={locale} />
          </div>

          {/* 멤버십 특징 정보 */}
          <div className={'mt-4 mb-4 text-[12px] text-[#A4A4A4] font-paperlogy'}>
            {membership.plan.canUsePracticeRoom && (
              <div> · 연습실 무제한 이용</div>
            )}
            {membership.plan.duration && (
              <div> · 유효기간: {membership.plan.duration}일</div>
            )}
          </div>

          <Divider/>

          {membership.plan.studio && (
            <div className={'py-5'}>
              <SellerInformation studio={membership.plan.studio} locale={locale} />
            </div>
          )}
        </div>
      </div>
    )
  } else {
    throw Error()
  }
}

