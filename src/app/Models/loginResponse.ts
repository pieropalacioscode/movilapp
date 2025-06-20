import { User } from "./User";

export interface LoginResponse{
  success: boolean;
  usuario: User;
  token: string;
  refreshToken: string;
  message: string;
}