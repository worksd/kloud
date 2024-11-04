import { UserStatus } from "@/entities/user/user.status";

export type UserResponse = {
  id: number;
  email: string;
  status: UserStatus;
}