import { Endpoint, SimpleResponse } from "@/app/endpoint/index";

// POST /tracking-events — 조회수(view) 등 트래킹 이벤트 적재.
// 응답은 204 No Content. fire-and-forget 으로 안전하게 호출 가능.

export type TrackingEventType = 'view';
export type TrackingEventSource = 'event' | 'lessonDetail' | 'lessonGroupDetail' | 'studioBanner';

export type RecordTrackingEventParameter = {
  type: TrackingEventType;
  source: TrackingEventSource;
  sourceId: number;
};

export const RecordTrackingEvent: Endpoint<RecordTrackingEventParameter, SimpleResponse> = {
  method: 'post',
  path: '/tracking-events',
  bodyParams: ['type', 'source', 'sourceId'],
};
