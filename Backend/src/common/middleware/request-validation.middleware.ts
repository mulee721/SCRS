import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_CONTENT_TYPES = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Check content length
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > this.MAX_BODY_SIZE) {
      throw new BadRequestException('Request body too large');
    }

    // Validate content type for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers['content-type'] || '';
      const isAllowed = this.ALLOWED_CONTENT_TYPES.some((allowed) => contentType.includes(allowed));

      if (!isAllowed && contentType) {
        throw new BadRequestException('Invalid content type');
      }
    }

    // Check for SQL injection patterns in query parameters
    this.validateInput(req.query);
    this.validateInput(req.params);

    next();
  }

  private validateInput(obj: any): void {
    if (!obj) return;

    const sqlPatterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
      /(-{2}|\/\*|\*\/|;|xp_|sp_)/i,
    ];

    for (const key in obj) {
      const value = String(obj[key]);
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          throw new BadRequestException(`Suspicious input detected in ${key}`);
        }
      }
    }
  }
}
