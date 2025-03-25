import { PassOrder } from "@/app/endpoint/pass.endpoint";
import { api } from "@/app/api.client";


export const getMyPassListAction = async ({order}: { order: PassOrder }) => {
  return await api.pass.list({order});
};