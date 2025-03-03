import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Privacy from "@/app/setting/privacy/Privacy";

export default async function PrivacyPage() {
  return (
    <div>
      <SimpleHeader title={'service_privacy_agreement'}/>
      <Privacy/>
    </div>
  )
}