import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorMessage = 'An error occurred';
    let errorCode = 'INTERNAL_ERROR';

    if (typeof exceptionResponse === 'object') {
      const errorObj = exceptionResponse as any;
      errorMessage = errorObj.message || errorMessage;
      errorCode = errorObj.error || errorCode;

      // Handle validation errors
      if (status === 400 && Array.isArray(errorObj.message)) {
        errorMessage = errorObj.message.join(', ');
        errorCode = 'VALIDATION_ERROR';
      }
    }

    response.status(status).json({
      success: false,
      error: errorCode,
      message: errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
