import { Locale, StringResource } from "@/shared/StringResource";

export const getSubscriptionStatus = ({ status, locale} : {status: string, locale: Locale}): string => {
  if (status === "Active") {
    return StringResource['active'][locale];
  }
  if (status === "Cancelled") {
    return StringResource['cancelled'][locale];
  }
  if (status === "Failed") {
    return StringResource['failed'][locale];
  }
  return '';
}