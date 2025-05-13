import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import Inquiry from "@/app/profile/inquiry/Inquiry";

export default async function InquiryPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="inquiry"/>
      </div>
      <Inquiry/>
    </div>
  )
}