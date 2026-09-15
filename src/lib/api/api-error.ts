import type { ApiErrorShape } from "@/lib/api/types";

export class ApiError extends Error {
  code: string;
  requestId: string;
  details?: Record<string, string[]>;
  status?: number;

  constructor(shape: ApiErrorShape, status?: number) {
    super(shape.message);
    this.name = "ApiError";
    this.code = shape.code;
    this.requestId = shape.requestId;
    this.details = shape.details;
    this.status = status;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
