import { DeveloperForm } from "@/app/profile/setting/developer/DeveloperForm";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default async function DeveloperPage() {
  return (
    <div className={'flex flex-col min-h-screen'}>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="developer_mode"/>
      </div>
      <DeveloperForm/>
    </div>

  )
}