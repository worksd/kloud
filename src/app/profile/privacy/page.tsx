import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Privacy from "@/app/profile/privacy/Privacy";

export default async function PrivacyPage() {
  return (
    <div>
      <SimpleHeader titleResource={'service_privacy_agreement'}/>
      <Privacy/>
    </div>
  )
}