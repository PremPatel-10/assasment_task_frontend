import { HttpErrorResponse } from '@angular/common/http';

/** The backend's ExceptionMiddleware always returns `{ status, error }` as the JSON body — that's
 * the human-readable message, not `HttpErrorResponse.message` (which is just a generic
 * "Http failure response for <url>: <code> <text>" string). */
export function errorMessage(err: HttpErrorResponse): string {
  return err.error?.error ?? err.message;
}
