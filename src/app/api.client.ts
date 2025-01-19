import { EndpointClient } from "@/app/endpoint.client";
import * as API from "./endpoint";
import { PostSignUpEmail } from "@/app/endpoint/auth.endpoint";


export class ApiClient extends EndpointClient {

  readonly auth = {
    token: this.endpointBuilder(API.Auth.GetAuthToken),
    email: this.endpointBuilder(API.Auth.PostAuthEmail),
    signUp: this.endpointBuilder(API.Auth.PostSignUpEmail),
    socialLogin: this.endpointBuilder(API.Auth.PostSocialLogin),
  }

  readonly user = {
    get: this.endpointBuilder(API.User.GetUser),
    update: this.endpointBuilder(API.User.UpdateUser)
  }
  
  readonly lesson = {
    get: this.endpointBuilder(API.Lesson.GetLesson),
    listPopular: this.endpointBuilder(API.Lesson.GetPopularLessons),
    getPayment: this.endpointBuilder(API.Lesson.GetLessonPayment),
  }

  readonly studio = {
    get: this.endpointBuilder(API.Studio.GetStudio),
    list: this.endpointBuilder(API.Studio.ListStudios),
  }

  readonly ticket = {
    get: this.endpointBuilder(API.Ticket.GetTicket),
    list: this.endpointBuilder(API.Ticket.ListTickets),
  }

  readonly studioFollow = {
    create: this.endpointBuilder(API.StudioFollow.Follow),
    delete: this.endpointBuilder(API.StudioFollow.UnFollow),
  }
}

export interface ClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}


export const api = new ApiClient({
  baseUrl: process.env.GUINNESS_API_SERVER,
  defaultHeaders: {
    'x-guinness-client': 'Web',
    'x-guinness-device-name': 'asd',
    'x-guinness-version': '1.0.0',
    'Content-Type': 'application/json',
  },
});

