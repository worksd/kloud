import { LanguageChangeForm } from "@/app/profile/setting/language/language.change.form";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";
import { getLocale } from "@/utils/translate";

export default async function LanguageSettingPage() {
  return (
    <div className={"flex flex-col w-screen min-h-screen bg-white"}>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="language_setting"/>
      </div>
      <LanguageChangeForm locale={await getLocale()}/>
    </div>
  )
}