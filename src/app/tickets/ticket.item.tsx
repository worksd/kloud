'use server';
import Image from "next/image"
import { KloudScreen } from "@/shared/kloud.screen";
import { convertStatusToMessage, TicketResponse } from "@/app/endpoint/ticket.endpoint";
import { Thumbnail } from "@/app/components/Thumbnail";
import { formatDateTime } from "@/utils/date.format";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export const TicketItem = async ({item}: { item: TicketResponse }) => {

  const formattedTime = await formatDateTime(item.lesson?.startTime ?? '')

  return (
    <NavigateClickWrapper method={'push'} route={KloudScreen.TicketDetail(item.id, false)}>
      <div className="bg-white active:scale-[0.98] active:bg-gray-100 transition-all duration-150 py-2">
        {/* 상단 날짜와 상태 */}
        <div className="flex justify-between items-center px-6 mb-3 mt-2">
          <span className="text-[#86898C] text-[14px] font-medium">{formattedTime.date} ({await translate(formattedTime.dayOfWeek)})</span>
          <span className="text-[#86898C] px-2 py-1 rounded-full border border-[#86898C] font-medium text-[12px]">
          {await translate(convertStatusToMessage({status: item.status}))}
        </span>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex gap-3 pl-6 mb-3">
          <div className="w-[84px] flex-shrink-0">
            <Thumbnail width={84} url={item.lesson?.thumbnailUrl ?? ''}/>
          </div>
          <div className="flex flex-col justify-center">
            {/* 제목 */}
            <h2 className="text-[16px] font-bold mb-1 text-black">
              {item.lesson?.title ?? ''}
            </h2>

            {/* 스튜디오 정보 */}
            <div className="flex items-start gap-2 mb-1">
              {item.lesson?.studio?.profileImageUrl && <Image
                className="w-[20px] h-[20px] rounded-full overflow-hidden flex-shrink-0"
                src={item.lesson?.studio?.profileImageUrl}
                alt={'로고 URL'}
                width={20}
                height={20}
              />}

              <div className={"flex flex-col items-start"}>
                  <span className="font-medium text-[14px] text-[#86898c]">
                    {item.lesson?.studio?.name}
                  </span>
                <span className="font-medium text-[12px] text-[#86898C]">
                    {item.lesson?.room?.name}
                  </span>
              </div>
            </div>

            {/* 일시 */}
            <div className={"flex flex-row items-center mb-1"}>
              <p className="text-[#86898C] text-[14px] font-medium">
                {formattedTime.date} ({await translate(formattedTime.dayOfWeek)}) {formattedTime.time}
              </p>
              <p className="text-[#86898C] text-[12px] font-medium">
                /{item.lesson?.duration} {await translate('minutes')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </NavigateClickWrapper>
  );
}