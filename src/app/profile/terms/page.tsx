import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Term from "@/app/profile/terms/Term";
import { cookies } from "next/headers";
import { localeKey } from "@/shared/cookies.key";

export default async function TermPage() {
  const locale = (await cookies()).get(localeKey)?.value ?? 'ko'
  return (
    <div>
      <SimpleHeader titleResource={'service_terms_agreement'}/>
      <Term locale={locale}/>
    </div>
  )
}