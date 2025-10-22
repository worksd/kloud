import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { cookies } from "next/headers";
import { localeKey } from "@/shared/cookies.key";
import Term from "@/app/profile/policy/terms/Term";

export default async function TermPage() {
  const locale = (await cookies()).get(localeKey)?.value ?? 'ko'
  return (
    <div>
      <Term locale={locale}/>
    </div>
  )
}