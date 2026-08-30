import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error.js';
import { ZodError } from 'zod';
import { env } from '../config/env.config.js';

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle Operational AppErrors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: null,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.errors,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle Unhandled Server Errors (500)
  if (env.NODE_ENV !== 'test') {
    console.error('🔥 Internal Server Error:', err);
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred',
      details: env.NODE_ENV === 'development' ? err.stack : null,
      timestamp: new Date().toISOString(),
    },
  });
}
