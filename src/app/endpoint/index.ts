type value = any;

export type Endpoint<
  Parameter extends Record<string, value> | string,
  Response extends Record<string, value> | string
> = {
  method: string;
  path: string | ((e: Parameter) => string);
  pathParams?: (keyof Parameter)[];
  queryParams?: (keyof Parameter)[];
  bodyParams?: (keyof Parameter)[];
  headers?: Record<string, string>;
};

export type NoParameter = object

export type SimpleResponse = {
  success: boolean
}

export * as Auth from './auth.endpoint'
export * as User from './user.endpoint'
export * as Lesson from './lesson.endpoint'
export * as Studio from './studio.endpoint'
export * as Ticket from './ticket.endpoint'
export * as Event from './event.endpoint'
export * as Question from './question.endpoint'
export * as Device from './device.endpoint'
export * as Notification from './notification.endpoint'
export * as Pass from './pass.endpoint'
export * as Payment from './payment.endpoint'
export * as PaymentRecord from './payment.record.endpoint'
export * as Billing from "./billing.endpoint"
export * as Subscription from "./subscription.endpoint"
export * as Home from "./home.endpoint"
export * as Artist from "./artist.endpoint"
export * as DynamicRoute from "./dynamic.route.endpoint"