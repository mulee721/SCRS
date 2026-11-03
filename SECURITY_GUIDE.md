# SCRS Security Best Practices

## Authentication & Authorization

### JWT Security
- **Access Token:** 15-minute expiration
- **Refresh Token:** 7-day expiration  
- **Storage:** Secure HTTP-only cookies (recommended) or localStorage with CSRF protection
- **Rotation:** Tokens automatically refresh on use
- **Validation:** Server-side validation on every protected endpoint

### Password Security
- **Hashing:** bcrypt with 10 rounds (production: 12 rounds)
- **Minimum Length:** 8 characters enforced
- **No Common Patterns:** Validate against common password lists
- **Reset Flow:** Time-limited tokens, email verification required

### Role-Based Access Control
```
Admin → All operations
Lecturer → Course management, grade entry, report viewing
Student → Course registration, grade viewing, profile update
```

## Data Protection

### MongoDB Security
```javascript
// Enable Authentication
MONGODB_URI=mongodb://username:password@host:27017/scrs

// Create strong passwords (min 16 chars)
// Use specific database users, not admin

// Enable encryption at rest
// storage:
//   engine: wiredTiger
//   wiredTiger:
//     engineConfig:
//       encryptionCipherMode: AES256-CBC
```

### Sensitive Data
- Passwords: Never logged or returned in API responses
- Tokens: Never stored in localStorage (except with CSRF protection)
- PII: Encrypted at database level when possible
- Audit Trail: Soft-delete enables accountability

### HTTPS/TLS
- **Required:** All production traffic must be HTTPS
- **Certificate:** Use valid SSL/TLS certificate (not self-signed in production)
- **HSTS:** Enable Strict-Transport-Security header (max-age: 1 year)
- **Protocol:** TLS 1.2 or higher only

## Input Validation

### Server-Side Validation (Always)
```typescript
// Every endpoint validates input
@IsEmail()
@IsString()
@MinLength(8)
@MaxLength(50)
password: string;

// Type checking with class-validator
@Min(1)
@Max(4)
academicYear: number;
```

### SQL Injection Prevention
- **ORM:** Mongoose prevents SQL injection natively
- **Validation Middleware:** Checks for suspicious patterns
- **Parameterized Queries:** Always used

### XSS Prevention
- **Sanitization:** Input sanitized before storage
- **Output Encoding:** React escapes content by default
- **CSP Headers:** Restrict script sources

## API Security

### Rate Limiting
```
Configuration: 100 requests per 60 seconds per IP
Applied to all endpoints
Exempt: Health check endpoint

Implement per-user limits for authenticated endpoints:
- Login attempts: 5 per 15 minutes
- API calls: 1000 per hour per user
```

### CORS Configuration
```typescript
cors: {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
```

### Endpoint Security
```
Public Endpoints: /health, /auth/register, /auth/login
Protected: All other endpoints require JWT

Protected by Role:
- Admin: Department CRUD, announcements, system reports
- Lecturer: Course assignment, grade entry
- Student: Registration, grades, profile
```

## Network Security

### Firewall Rules
```
Production:
- Port 443 (HTTPS): Open to public
- Port 3000 (Backend API): Only from frontend server
- Port 27017 (MongoDB): Only from backend server
- SSH (22): Only from admin IPs
```

### DDoS Protection
- Use CDN for frontend assets
- Implement rate limiting per IP
- Deploy WAF (Web Application Firewall)
- Monitor traffic patterns

## Code Security

### Dependency Management
```bash
# Regular audits
npm audit
npm audit fix

# Lock versions
npm ci (not npm install)

# Remove unused packages
npm prune --production
```

### Secrets Management
```bash
# Never commit .env file
# Use environment variables in production
# Rotate secrets regularly
# Audit access to secrets

# Environment variables only
JWT_SECRET=never_in_git
MONGODB_PASSWORD=never_in_git
```

### Code Review Checklist
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Error messages don't leak info
- [ ] Logging doesn't contain sensitive data
- [ ] Rate limiting applied
- [ ] Authentication/authorization correct

## Database Security

### Access Control
```bash
# Principle of Least Privilege
- App user: Read/Write specific database only
- Backup user: Read only
- Admin user: Full access

# Enable authentication
auth:
  authorization: enabled
```

### Backup & Recovery
```bash
# Daily encrypted backups
- Off-site storage
- Test recovery monthly
- 30-day retention minimum

# Encryption
- In transit: SSH/SSL
- At rest: AES-256
```

### Monitoring
- Track failed login attempts
- Monitor unusual query patterns
- Alert on large data exports
- Track user access logs

## Frontend Security

### Token Storage
```javascript
// Recommended: HttpOnly Secure Cookies
// Fallback: localStorage with CSRF token

// In api.ts:
// Tokens stored in localStorage
// CSRF token sent with each request
// Token refresh on 401 response
```

### XSS Protection
```typescript
// React escapes by default
// Avoid dangerouslySetInnerHTML
// Sanitize external content

// Content Security Policy headers enforce this
```

### CSRF Protection
```typescript
// Token in request header
headers['X-CSRF-Token'] = token

// Generated per session
// Validated on server
```

## Compliance & Audit

### Data Privacy
- GDPR: Support data export/deletion
- Consent: Log user consent for data collection
- Retention: Delete data per policy
- Right to be forgotten: Implement deletion flow

### Audit Logging
```javascript
// Every operation logged:
{
  timestamp: ISOString,
  userId: ObjectId,
  action: 'CREATE_COURSE',
  resource: 'Course',
  resourceId: ObjectId,
  changes: { before, after },
  ipAddress: string,
  status: 'success|failure'
}
```

### Compliance Checklist
- [ ] Audit logs enabled
- [ ] Data classification implemented
- [ ] Privacy policy updated
- [ ] Terms of service current
- [ ] Incident response plan documented
- [ ] Security training completed
- [ ] Penetration testing done
- [ ] Vulnerability scanning enabled

## Incident Response

### Security Incident Procedure
1. **Isolate:** Disconnect affected systems from network
2. **Assess:** Determine scope and severity
3. **Contain:** Stop the bleeding (reset compromised passwords)
4. **Document:** Log all actions taken
5. **Recover:** Restore from clean backup
6. **Review:** Post-mortem and lessons learned

### Reporting
- Report critical issues immediately
- Document all findings
- Contact authorities if required
- Notify affected users within 72 hours

## Regular Security Tasks

### Monthly
- [ ] Review access logs
- [ ] Check for failed login patterns
- [ ] Update dependencies
- [ ] Review security alerts

### Quarterly
- [ ] Penetration testing
- [ ] Security audit
- [ ] Password policy review
- [ ] Backup recovery test

### Annually
- [ ] Third-party security assessment
- [ ] Compliance audit
- [ ] Team security training
- [ ] Disaster recovery drill

## Emergency Contacts

- Security Team: security@yourdomain.com
- System Admin: admin@yourdomain.com
- Incident Response: +1-XXX-XXX-XXXX

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security-checklist/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Version:** 1.0  
**Last Updated:** October 31, 2026  
**Status:** Active
