import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Inquiry from "@/app/setting/inquiry/Inquiry";

export default async function InquiryPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader title="문의하기"/>
      </div>
      <Inquiry/>
    </div>
  )
}