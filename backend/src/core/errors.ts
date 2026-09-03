import { ZodError } from 'zod';

// AppError hierarchy

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, string[]>;
  public readonly isOperational: boolean;

  constructor(options: {
    message: string;
    statusCode: number;
    errorCode: string;
    details?: Record<string, string[]>;
    isOperational?: boolean;
  }) {
    super(options.message);
    this.statusCode = options.statusCode;
    this.errorCode = options.errorCode;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Typed subclasses

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: Record<string, string[]>) {
    super({ message, statusCode: 400, errorCode: 'BAD_REQUEST', details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super({ message, statusCode: 401, errorCode: 'UNAUTHORIZED' });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super({ message, statusCode: 403, errorCode: 'FORBIDDEN' });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super({ message, statusCode: 404, errorCode: 'NOT_FOUND' });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', details?: Record<string, string[]>) {
    super({ message, statusCode: 409, errorCode: 'CONFLICT', details });
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super({
      message: 'Validation failed',
      statusCode: 422,
      errorCode: 'VALIDATION_ERROR',
      details,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super({ message, statusCode: 429, errorCode: 'RATE_LIMITED' });
  }
}

export class UpstreamError extends AppError {
  constructor(message = 'Upstream failure') {
    super({ message, statusCode: 502, errorCode: 'UPSTREAM_FAILURE' });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super({ message, statusCode: 503, errorCode: 'SERVICE_UNAVAILABLE' });
  }
}

// Zod -> 422 helper

export function zodToValidationError(err: ZodError): ValidationError {
  const details: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.');
    details[key] = details[key] ?? [];
    details[key].push(issue.message);
  }
  return new ValidationError(details);
}

// Unknown error -> 500 with no leak

export class UnknownError extends AppError {
  constructor(traceId?: string) {
    super({
      message: 'Internal server error',
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      details: traceId ? { trace: [traceId] } : undefined,
    });
  }
}
