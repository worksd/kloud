export type GetLessonResponse = {
  id: number;
  type: LessonType;
}

export enum LessonType {
  Regular = 'Regular',
  PopUp = 'PopUp',
}