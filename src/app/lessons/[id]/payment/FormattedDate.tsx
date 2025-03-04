'use server'
import { formatDateTime } from "@/utils/date.format";
import { useLocale } from "@/hooks/useLocale";

export const FormattedDate = async ({startTime} : { startTime: string}) => {
  const formattedTime = await formatDateTime(startTime ?? '')
  return <p className="text-[#86898C] text-[14px] font-medium">
    {formattedTime.date} ({formattedTime.dayOfWeek}) {formattedTime.time}
  </p>
}