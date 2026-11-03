import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection (for older browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Strict Transport Security (HSTS) - uncomment in production with HTTPS
    // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
    );

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature Policy)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    // Remove server header to avoid revealing technology stack
    res.removeHeader('Server');
    res.removeHeader('X-Powered-By');

    // Add request ID for logging and tracking
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    next();
  }
}
