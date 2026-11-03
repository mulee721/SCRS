import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Fields that must NEVER appear in any API response, regardless of how
 * deep they are nested in the payload.
 */
const SENSITIVE_FIELDS = new Set(['password', 'refreshTokens', '__v']);

/**
 * Recursively strip sensitive fields from any plain object or array.
 * This is a safety net — the schema's `select: false` and the hand-built
 * response objects in AuthService are the primary protection.
 */
function stripSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSensitiveFields);
  }

  if (value !== null && typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (!SENSITIVE_FIELDS.has(k)) {
        clean[k] = stripSensitiveFields(v);
      }
    }
    return clean;
  }

  return value;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Sanitise first — remove any accidentally-leaked sensitive fields
        const sanitised = stripSensitiveFields(data) as typeof data;

        // If the service already built a { success, ... } envelope, return it
        if ((sanitised as any)?.success !== undefined) {
          return sanitised as Response<T>;
        }

        // Paginated response
        if ((sanitised as any)?.data && (sanitised as any)?.pagination) {
          return {
            success:    true,
            data:       (sanitised as any).data,
            pagination: (sanitised as any).pagination,
          } as any;
        }

        // Standard wrapper
        return {
          success: true,
          data:    sanitised,
          message: 'Operation successful',
        };
      }),
    );
  }
}
