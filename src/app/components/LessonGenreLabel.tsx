'use client'
import { LessonGenre } from "@/app/endpoint/lesson.endpoint";
import { LessonLevels, LessonType } from "@/entities/lesson/lesson";

export const LessonGenreLabel = ({ genre }: { genre: LessonGenre }) => {
  let labelText: string | undefined = undefined;

  if (genre === 'Breaking') labelText = 'Breakin';
  else if (genre === 'Choreography') labelText = 'Choreo';

  if (!labelText) return null;

  return (
    <div className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-[rgba(0,0,0,0.5)] text-white shadow-sm backdrop-blur-sm">
      {labelText}
    </div>
  );
};

export const LessonTypeLabel = ({ type }: { type: LessonType }) => {
  let labelText: string | undefined = undefined;

  if (type === LessonType.PopUp) labelText = '팝업';
  else if (type === LessonType.Regular) labelText = '정규';

  if (!labelText) return null;

  return (
    <div className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-[rgba(0,0,0,0.5)] text-white shadow-sm backdrop-blur-sm">
      {labelText}
    </div>
  );
};

export const LessonLevelLabel = ({ level} : {level: LessonLevels}) => {
  let labelText: string | undefined = undefined;

  if (level === LessonLevels.Advanced) labelText = '고급';
  else if (level === LessonLevels.Beginner) labelText = '초급';
  else if (level == LessonLevels.Basic) labelText = '기본';

  if (!labelText) return null;

  return (
    <div className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-black text-white shadow-sm backdrop-blur-sm">
      {labelText}
    </div>
  );
}