export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn?: string;
}
