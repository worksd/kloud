'use client';
import { formatDateTime } from "@/utils/date.format";
import { useLocale } from "@/hooks/useLocale";

export const FormattedDate = ({startTime} : { startTime: string}) => {
  const {locale} = useLocale();
  const formattedTime = formatDateTime(startTime ?? '', locale)
  return <p className="text-[#86898C] text-[14px] font-medium">
    {formattedTime.date} ({formattedTime.dayOfWeek}) {formattedTime.time}
  </p>
}