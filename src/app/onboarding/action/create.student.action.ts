'use server'
import { api } from "@/app/api.client";

export async function createStudentAction({ studioId }: { studioId: number }) {
  return await api.student.create({ studioId });
}
