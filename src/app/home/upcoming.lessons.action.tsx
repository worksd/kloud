import { ListLessonsResponse } from "@/app/endpoint/lesson.endpoint";

export async function getUpcomingLessons(): Promise<ListLessonsResponse> {
  return {
    lessons: []
  };
}