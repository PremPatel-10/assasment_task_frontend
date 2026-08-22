export interface LoginReq {
  username: string;
  password: string;
}

export interface RegisterReq {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string;
  expiresAtUtc: string;
}
