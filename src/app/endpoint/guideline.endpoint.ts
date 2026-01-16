import { Endpoint } from "@/app/endpoint/index";

export type GuidelineResponse = {
  id: number;
  content: string;
  title: string;
  isContentEditable: boolean;
};

export type GuidelinesResponse = {
  guidelines: GuidelineResponse[];
};

export type GetGuidelinesParameter = {
  studioId: number;
};

export const GetGuidelines: Endpoint<GetGuidelinesParameter, GuidelinesResponse> = {
  method: "get",
  path: `/guidelines`,
  queryParams: ["studioId"],
};
