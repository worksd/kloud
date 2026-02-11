import { EndpointClient } from '@/app/endpoint.client';
import * as API from './endpoint';
import {GetMe} from "@/app/endpoint/user.endpoint";


export class ApiClient extends EndpointClient {

  readonly auth = {
    token: this.endpointBuilder(API.Auth.GetAuthToken),
    email: this.endpointBuilder(API.Auth.PostAuthEmail),
    comparePassword: this.endpointBuilder(API.Auth.ComparePassword),
    signUp: this.endpointBuilder(API.Auth.PostSignUpEmail),
    socialLogin: this.endpointBuilder(API.Auth.PostSocialLogin),
    sendEmailVerification: this.endpointBuilder(API.Auth.SendVerificationEmail),
    sendPhoneVerification: this.endpointBuilder(API.Auth.SendPhoneVerification),
    checkPhoneVerification: this.endpointBuilder(API.Auth.CheckPhoneVerification),
  }

  readonly user = {
    get: this.endpointBuilder(API.User.GetUser),
    me: this.endpointBuilder(API.User.GetMe),
    update: this.endpointBuilder(API.User.UpdateUser),
    delete: this.endpointBuilder(API.User.DeleteUser),
    checkDuplicate: this.endpointBuilder(API.User.CheckDuplicate),
    connectParent: this.endpointBuilder(API.User.CreateParentConnection)
  }

  readonly lesson = {
    get: this.endpointBuilder(API.Lesson.GetLesson),
    listOngoingLessons: this.endpointBuilder(API.Lesson.ListOngoingLessons),
    listByDate: this.endpointBuilder(API.Lesson.ListStudioLessonsByDate),
    checkCapacity: this.endpointBuilder(API.Lesson.CheckCapacity),
  }

  readonly lessonGroup = {
    get: this.endpointBuilder(API.Lesson.GetLessonGroup),
    getLessons: this.endpointBuilder(API.Lesson.GetLessonGroupLessons),
  }

  readonly studio = {
    get: this.endpointBuilder(API.Studio.GetStudio),
    list: this.endpointBuilder(API.Studio.ListStudios),
    me: this.endpointBuilder(API.Studio.Me),
    my: this.endpointBuilder(API.Studio.My),
    timeTable: this.endpointBuilder(API.Studio.TimeTable),
  }

  readonly ticket = {
    get: this.endpointBuilder(API.Ticket.GetTicket),
    list: this.endpointBuilder(API.Ticket.ListTickets),
    create: this.endpointBuilder(API.Ticket.CreateTicket),
    getInviteTicket: this.endpointBuilder(API.Ticket.GetInviteTicket),
    checkDuplicate: this.endpointBuilder(API.Ticket.CheckDuplicateTicket),
    delete: this.endpointBuilder(API.Ticket.DeleteTicket),
    toUsed: this.endpointBuilder(API.Ticket.ToUsed),
  }

  readonly lessonGroupTicket = {
    get: this.endpointBuilder(API.Ticket.GetLessonGroupTicket),
    list: this.endpointBuilder(API.Ticket.ListLessonGroupTickets),
    delete: this.endpointBuilder(API.Ticket.DeleteLessonGroupTicket),
  }

  readonly question = {
    create: this.endpointBuilder(API.Question.CreateQuestion)
  }

  readonly event = {
    list: this.endpointBuilder(API.Event.GetEventList),
  }

  readonly device = {
    register: this.endpointBuilder(API.Device.RegisterDevice),
    unregister: this.endpointBuilder(API.Device.UnregisterDevice),
  }

  readonly notification = {
    get: this.endpointBuilder(API.Notification.GetNotifications)
  }

  readonly pass = {
    list: this.endpointBuilder(API.Pass.GetPasses),
    listPlans: this.endpointBuilder(API.Pass.GetPassPlans),
    get: this.endpointBuilder(API.Pass.GetPass),
    create: this.endpointBuilder(API.Pass.CreatePass),
    use: this.endpointBuilder(API.Pass.UsePass),
  }

  readonly payment = {
    get: this.endpointBuilder(API.Payment.GetPayment),
    createByBillingKey: this.endpointBuilder(API.Payment.CreateBillingKeyPayment),
  }

  readonly paymentRecord = {
    list: this.endpointBuilder(API.PaymentRecord.GetPaymentRecords),
    get: this.endpointBuilder(API.PaymentRecord.GetPaymentRecordDetail),
    getRefundPreview: this.endpointBuilder(API.PaymentRecord.GetRefundPreview),
    requestRefund: this.endpointBuilder(API.PaymentRecord.RequestRefund),
    createManual: this.endpointBuilder(API.PaymentRecord.CreateManualPaymentRecord),
  }

  readonly billing = {
    get: this.endpointBuilder(API.Billing.List),
    create: this.endpointBuilder(API.Billing.Create),
    delete: this.endpointBuilder(API.Billing.Delete),
  }

  readonly subscription = {
    create: this.endpointBuilder(API.Subscription.Create),
    list: this.endpointBuilder(API.Subscription.List),
    get: this.endpointBuilder(API.Subscription.Get),
    cancel: this.endpointBuilder(API.Subscription.Cancel),
  }

  readonly home = {
    getHome: this.endpointBuilder(API.Home.GetHome),
    getStage: this.endpointBuilder(API.Home.GetStage),
  }

  readonly artist = {
    getArtist: this.endpointBuilder(API.Artist.getArtist),
  }

  readonly membership = {
    listPlans: this.endpointBuilder(API.Membership.GetMembershipPlans),
    get: this.endpointBuilder(API.Membership.GetMembership),
  }

  readonly common = {
    get: this.endpointBuilder(API.DynamicRoute.DynamicGET)
  }

  readonly guideline = {
    list: this.endpointBuilder(API.Guideline.GetGuidelines),
  }
}

export interface ClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}


export const api = new ApiClient();

