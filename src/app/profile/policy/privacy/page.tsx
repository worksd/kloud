import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Privacy from "@/app/profile/policy/privacy/Privacy";
import { cookies } from "next/headers";
import { localeKey } from "@/shared/cookies.key";

export default async function PrivacyPage() {
  const locale = (await cookies()).get(localeKey)?.value ?? 'ko'

  return (
    <div>
      <Privacy locale={locale}/>
    </div>
  )
}