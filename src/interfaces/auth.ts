export type JwtPayload = {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
};

export enum UserRole {
  SUPER_ADMIN = 0,
  ADMIN = 1,
  PUBLISHER = 2,
  USER = 3,
}

export type ValidateUserOK = {
  success: true;
  id: number;
  role: number;
};

export type ValidateUserKO = {
  success: false;
  message: string;
  code: number;
};

export type ValidateUserResult = ValidateUserOK | ValidateUserKO;
