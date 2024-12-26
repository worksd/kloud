import { Studio } from "@/entities/studio/studio";

export type Lesson = {
  id: number;
  title: string;
  date: string;
  studio: Studio;
  posterUrl: string;
}