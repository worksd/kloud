import { LanguageChangeForm } from "@/app/setting/account/language/language.change.form";
import { SimpleHeader } from "@/app/components/headers/SimpleHeader";

export default function LanguageSettings() {
  return (
    <div className={"flex flex-col w-screen min-h-screen bg-white"}>
      <div className="flex justify-between items-center mb-14">
        <SimpleHeader titleResource="language_setting"/>
      </div>
      <LanguageChangeForm/>
    </div>
  )
}