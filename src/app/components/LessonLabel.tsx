'use client'
import { LessonType } from "@/entities/lesson/lesson";
import { StringResourceKey } from "@/shared/StringResource";
import { useLocale } from "@/hooks/useLocale";

export const LessonLabel = ({label}: { label: string }) => {
  return (
    <div
      className="inline-block px-1 py-0.5 rounded-[6px] text-[12px] font-paperlogy bg-[#F5F5F8] text-[#707070] shadow-sm backdrop-blur-sm">
      {label}
    </div>
  );
};

export const LessonTypeLabel = ({type}: { type: LessonType }) => {
  const {t} = useLocale();
  const labelKey = getLessonType({type});

  if (!labelKey) return null;

  return (
    <div
      className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-[rgba(0,0,0,0.5)] text-white shadow-sm backdrop-blur-sm">
      {t(labelKey)}
    </div>
  );
};


export const LessonPosterTypeLabel = ({label}: { label: string }) => {
  if (label == 'Default') return;
  return (
    <div
      className="absolute top-0 left-0 text-white text-[12px] font-bold py-[6px] pl-[12px] pr-[8px] rounded-tl-[16px] rounded-br-[10px] font-paperlogy"
      style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      {label}
    </div>
  )
}

export const LessonLevelLabel = ({label}: { label: string }) => {
  return (
    <div
      className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-black text-white shadow-sm backdrop-blur-sm">
      {label}
    </div>
  );
}

const getLessonType = ({
                         type,
                       }: {
  type: LessonType;
}): StringResourceKey | undefined => {
  if (type === LessonType.Regular) {
    return 'regular';
  } else if (type == LessonType.Audition) {
    return 'audition';
  } else if (type == LessonType.PopUp) {
    return 'popup';
  } else if (type == LessonType.Workshop) {
    return 'workshop';
  }

  return undefined;
};