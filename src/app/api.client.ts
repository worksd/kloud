import { EndpointClient } from "@/app/endpoint.client";
import * as API from "./endpoint";
import { ComparePassword } from "@/app/endpoint/auth.endpoint";


export class ApiClient extends EndpointClient {

  readonly auth = {
    token: this.endpointBuilder(API.Auth.GetAuthToken),
    email: this.endpointBuilder(API.Auth.PostAuthEmail),
    comparePassword: this.endpointBuilder(API.Auth.ComparePassword),
    signUp: this.endpointBuilder(API.Auth.PostSignUpEmail),
    socialLogin: this.endpointBuilder(API.Auth.PostSocialLogin),
    sendEmailVerification: this.endpointBuilder(API.Auth.SendVerificationEmail),
  }

  readonly user = {
    get: this.endpointBuilder(API.User.GetUser),
    update: this.endpointBuilder(API.User.UpdateUser),
    me: this.endpointBuilder(API.User.Me),
    delete: this.endpointBuilder(API.User.DeleteUser),
    checkDuplicate: this.endpointBuilder(API.User.CheckDuplicate),
  }
  
  readonly lesson = {
    get: this.endpointBuilder(API.Lesson.GetLesson),
    listPopular: this.endpointBuilder(API.Lesson.GetPopularLessons),
    listStudioLessons: this.endpointBuilder(API.Lesson.ListStudioLessons),
    listStageBands: this.endpointBuilder(API.Lesson.ListStageBands),
    listOngoingLessons: this.endpointBuilder(API.Lesson.ListOngoingLessons),
  }

  readonly studio = {
    get: this.endpointBuilder(API.Studio.GetStudio),
    list: this.endpointBuilder(API.Studio.ListStudios),
    me: this.endpointBuilder(API.Studio.Me),
    my: this.endpointBuilder(API.Studio.My),
  }

  readonly ticket = {
    get: this.endpointBuilder(API.Ticket.GetTicket),
    list: this.endpointBuilder(API.Ticket.ListTickets),
    create: this.endpointBuilder(API.Ticket.CreateTicket),
  }

  readonly studioFollow = {
    create: this.endpointBuilder(API.StudioFollow.Follow),
    delete: this.endpointBuilder(API.StudioFollow.UnFollow),
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
  }

  readonly paymentRecord = {
    list: this.endpointBuilder(API.PaymentRecord.GetPaymentRecords),
    get: this.endpointBuilder(API.PaymentRecord.GetPaymentRecordDetail),
    requestAccountTransfer: this.endpointBuilder(API.PaymentRecord.RequestAccountTransfer),
  }
}

export interface ClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}


export const api = new ApiClient();

