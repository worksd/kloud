import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Term from "@/app/setting/terms/Term";

export default async function TermPage() {
  return (
    <div>
      <SimpleHeader title={"서비스 이용약관"}/>
      <Term/>
    </div>
  )
}