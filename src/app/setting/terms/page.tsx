import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Term from "@/app/setting/terms/Term";

export default async function TermPage() {
  return (
    <div>
      <SimpleHeader title={'service_terms_agreement'}/>
      <Term/>
    </div>
  )
}