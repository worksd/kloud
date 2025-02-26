'use server'
import { api } from "@/app/api.client";

export async function getJumbotronList() {
  const res = await api.lesson.listPopular({});

  if ('lessons' in res) {
    return {
      lessons: res.lessons
    }
  } else {
    return {
      errorMessage: res.message,
    }
  }
}

