export type UserRole = "contributor" | "maintainer";

export interface DbUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: number;
  name: string;
  role: UserRole;
}

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginBody {
  email: string;
  password: string;
}
