'use server'
import ArrowLeftIcon from "../../../../public/assets/left-arrow.svg";
import { StringResource } from "@/shared/StringResource";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export async function SimpleHeader({ titleResource }: {
  titleResource?: keyof (typeof StringResource)["ko"] | undefined
}) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-10">
      <div className="relative grid grid-cols-3 h-14 items-center px-4">
        <NavigateClickWrapper method={'back'}>
          <button className="flex items-center justify-start text-black rounded-full">
            <ArrowLeftIcon className="w-6 h-6"/>
          </button>
        </NavigateClickWrapper>
        {titleResource && (
          <h1 className="text-center text-[16px] font-bold text-black">
            {await translate(titleResource)}
          </h1>
        )}
      </div>
    </div>
  );
}
