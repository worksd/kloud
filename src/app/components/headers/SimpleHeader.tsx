'use server'
import ArrowLeftIcon from "../../../../public/assets/left-arrow.svg";
import { StringResourceKey } from "@/shared/StringResource";
import { translate } from "@/utils/translate";
import { NavigateClickWrapper } from "@/utils/NavigateClickWrapper";

export async function SimpleHeader({titleResource}: {
  titleResource?: StringResourceKey
}) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-10">
      <div className="relative grid grid-cols-[auto_1fr_auto] h-14 items-center px-6 gap-4">
        <div className="w-6"> {/* 뒤로가기 버튼 영역 고정 */}
          <NavigateClickWrapper method={'back'}>
            <button className="flex items-center justify-start text-black rounded-full">
              <ArrowLeftIcon className="w-6 h-6"/>
            </button>
          </NavigateClickWrapper>
        </div>

        {titleResource && (
          <h1 className="text-center text-[16px] font-bold text-black truncate">
            {await translate(titleResource)}
          </h1>
        )}

        <div className="w-6"></div> {/* 우측 여백 균형을 위한 더미 div */}
      </div>
    </div>
  );
}


export async function DynamicHeader({title}: {
  title?: string
}) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white z-10">
      <div className="relative grid grid-cols-[auto_1fr_auto] h-14 items-center px-6 gap-4">
        <div className="w-6"> {/* 뒤로가기 버튼 영역 고정 */}
          <NavigateClickWrapper method={'back'}>
            <button className="flex items-center justify-start text-black rounded-full">
              <ArrowLeftIcon className="w-6 h-6"/>
            </button>
          </NavigateClickWrapper>
        </div>

        {title && (
          <h1 className="text-center text-[16px] font-bold text-black truncate">
            {title}
          </h1>
        )}

        <div className="w-6"></div> {/* 우측 여백 균형을 위한 더미 div */}
      </div>
    </div>
  );
}