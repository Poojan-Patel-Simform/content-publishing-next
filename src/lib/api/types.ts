export interface ApiErrorShape {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, string[]>;
}

export interface ApiEnvelopeSuccess<T> {
  success: true;
  data: T;
}

export interface ApiEnvelopeError {
  success: false;
  error: ApiErrorShape;
}

export type ApiEnvelope<T> = ApiEnvelopeSuccess<T> | ApiEnvelopeError;

export type UserRole = "AUTHOR" | "EDITOR";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  avatarUrl: string | null;
}
