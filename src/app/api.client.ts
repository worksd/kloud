import { EndpointClient } from "@/app/endpoint.client";
import * as API from "./endpoint";


export class ApiClient extends EndpointClient {

  readonly auth = {
    token: this.endpointBuilder(API.Auth.GetAuthToken),
    email: this.endpointBuilder(API.Auth.PostAuthEmail),
    signUp: this.endpointBuilder(API.Auth.PostSignUpEmail),
    socialLogin: this.endpointBuilder(API.Auth.PostSocialLogin),
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
    getPayment: this.endpointBuilder(API.Lesson.GetLessonPayment),
    listStudioLessons: this.endpointBuilder(API.Lesson.ListStudioLessons),
  }

  readonly studio = {
    get: this.endpointBuilder(API.Studio.GetStudio),
    list: this.endpointBuilder(API.Studio.ListStudios),
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
}

export interface ClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}


export const api = new ApiClient();

