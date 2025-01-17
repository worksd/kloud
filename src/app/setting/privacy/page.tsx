import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Privacy from "@/app/setting/privacy/Privacy";

export default async function PrivacyPage() {
  return (
    <div>
      <SimpleHeader title={"개인정보 수집 및 이용동의"}/>
      <Privacy/>
    </div>
  )
}