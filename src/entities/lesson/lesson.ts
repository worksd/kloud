import { Studio } from "@/entities/studio/studio";

export type Lesson = {
    id: number;
    title: string;
    date: string;
    studio: Studio;
    posterUrl: string;
};

export enum LessonTypes {
  PopUp = "PopUp",
  Regular = "Regular",
}

export enum LessonTypesDisplay {
    PopUp = "팝업",
    Regular = "정규",
}

export enum LessonLevels {
  Advanced = "Advanced",
  Basic = "Basic",
  Beginner = "Beginner",
}

export enum LessonLevelsDisplay {
    Advanced = "고급",
    Basic = "베이직",
    Beginner = "비기너",
}
