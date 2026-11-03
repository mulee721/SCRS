import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Initialize session token if not exists
    if (!req.session?.csrfToken) {
      req.session!.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // For POST, PUT, DELETE, PATCH - validate token
    const token = req.headers['x-csrf-token'] || req.body?.csrfToken;

    if (!token || token !== req.session?.csrfToken) {
      throw new BadRequestException('Invalid CSRF token');
    }

    // Send new token in response header for next request
    res.setHeader('X-CSRF-Token', req.session!.csrfToken);

    next();
  }
}
