# Student Course Registration System (SCRS) - NestJS Backend

A production-ready, enterprise-grade backend for a comprehensive Student Course Registration System built with **NestJS**, **TypeScript**, **MongoDB**, and **JWT authentication**.

## ✨ Features

### Core Functionality
- ✅ **JWT Authentication** - 15-minute access tokens + 7-day refresh tokens
- ✅ **Role-Based Access Control** - Admin, Lecturer, Student roles
- ✅ **Course Registration** - With 8 validation rules
- ✅ **Timetable Conflict Detection** - Prevents scheduling overlaps
- ✅ **Credit Limit Enforcement** - 18 credits per semester (configurable)
- ✅ **Grade Management** - Auto-conversion (score → letter → GPA)
- ✅ **GPA Calculation** - Semester and cumulative GPA
- ✅ **Reporting System** - 6 analytics reports
- ✅ **Announcements & Notifications** - System-wide communication
- ✅ **Pagination & Filtering** - For large datasets

### Technical Excellence
- ✅ **TypeScript** - Full type safety
- ✅ **Swagger Documentation** - Interactive API explorer at `/api`
- ✅ **MongoDB Indexing** - Performance optimization
- ✅ **Soft-Delete Pattern** - Audit trail & data recovery
- ✅ **Global Error Handling** - Consistent error responses
- ✅ **Rate Limiting** - 100 requests/minute protection
- ✅ **CORS Configuration** - Frontend integration ready
- ✅ **Environment Validation** - Secure configuration

## 📊 API Overview

### 68 Total Endpoints

| Module | Endpoints | Key Features |
|--------|-----------|--------------|
| **Auth** | 5 | Register, Login, Refresh, Logout, Get Profile |
| **Users** | 2 | Profile management |
| **Students** | 6 | CRUD operations, profile management |
| **Lecturers** | 6 | CRUD operations by department |
| **Departments** | 5 | CRUD operations |
| **Courses** | 7 | Catalog, prerequisites, scheduling |
| **Semesters** | 7 | Academic periods, registration windows |
| **Registrations** | 9 | Register (8-rule validation), my courses, timetable |
| **Grades** | 7 | Entry, transcript, GPA calculation |
| **Announcements** | 5 | Create, publish, manage |
| **Notifications** | 5 | Notifications with 30-day TTL |
| **Reports** | 6 | Enrollment, academic, course, student analytics |

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│ API Layer (68 Endpoints)               │
├─────────────────────────────────────────┤
│ Controllers (request handling)          │
├─────────────────────────────────────────┤
│ Services (business logic)               │
│ ├─ RegistrationValidator (8 rules)     │
│ ├─ GradeCalculator (auto-conversion)   │
│ ├─ TimetableChecker (conflict detect)  │
│ └─ ReportGenerator (6 reports)         │
├─────────────────────────────────────────┤
│ Data Access (Mongoose models)           │
├─────────────────────────────────────────┤
│ MongoDB (10 collections)                │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB 6.0+

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file in project root:
```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/SCRS
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=SCRS

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-this!
JWT_EXPIRATION=900
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters-long!
JWT_REFRESH_EXPIRATION=604800

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:3001

# System Settings
CREDIT_LIMIT=18
REQUIRE_APPROVAL=false
UNIVERSITY_NAME=Addis Valley University
LOG_LEVEL=debug
```

### 3. Start MongoDB
```bash
# Option A: Local installation
mongod

# Option B: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option C: MongoDB Atlas (Cloud)
# Get connection string from https://www.mongodb.com/cloud/atlas
# Update MONGODB_URI in .env
```

### 4. Run Development Server
```bash
npm run start:dev
```

Server will start at `http://localhost:3000`

### 5. Explore API Documentation
Open `http://localhost:3000/api` in your browser for interactive Swagger documentation.

## 📖 Available Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start              # Start normally
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Run production build

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format with Prettier

# Testing
npm test                   # Run tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Generate coverage report
npm run test:debug        # Run tests in debug mode
```

## 🔐 Registration Validation Rules

When a student registers for a course, the system enforces 8 critical business rules:

1. **No Duplicate Registration** - Cannot register for same course twice
2. **Course Capacity** - Cannot exceed course enrollment limit
3. **Credit Limit** - Total credits cannot exceed 18 (configurable)
4. **Timetable Conflict** - No overlapping course schedules on same day
5. **Registration Period** - Must be within semester registration window
6. **Student Active** - Student account must be active
7. **Course Active** - Course must be available
8. **Prerequisites** - All prerequisites must be completed with passing grade

All validations happen server-side for data integrity.

## 📊 Grade Management

### Automatic Grade Conversion
```
Score Input (0-100)
    ↓
Letter Grade (A-F)
    ↓
GPA Points (0-4.0)
    ↓
Stored in Database
```

### Grade Scale
| Score | Letter | GPA |
|-------|--------|-----|
| 90-100 | A | 4.0 |
| 85-89 | A- | 3.75 |
| 80-84 | B+ | 3.5 |
| 75-79 | B | 3.0 |
| 70-74 | C+ | 2.5 |
| 60-69 | C | 2.0 |
| 50-59 | D | 1.0 |
| <50 | F | 0.0 |

### GPA Calculation
- **Semester GPA:** Weighted average of all grades in semester (credits × GPA)
- **Cumulative GPA:** Weighted average across all semesters

## 🗄️ Database Collections

1. **users** - User authentication & identity
2. **students** - Student profiles & enrollment data
3. **lecturers** - Lecturer profiles
4. **departments** - Department information
5. **courses** - Course catalog with prerequisites & scheduling
6. **semesters** - Academic periods with registration windows
7. **registrations** - Student course enrollments
8. **grades** - Student grades with GPA calculations
9. **announcements** - System announcements
10. **notifications** - User notifications (auto-cleanup after 30 days)

## 🔗 Frontend Integration

### Install Axios
```bash
npm install axios
```

### Setup API Client
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:3000/auth/refresh', {
            refreshToken,
          });
          localStorage.setItem('accessToken', res.data.data.accessToken);
          localStorage.setItem('refreshToken', res.data.data.refreshToken);
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Example Usage
```typescript
import api from '@/lib/api';

// Login
const response = await api.post('/auth/login', {
  email: 'student@university.edu',
  password: 'password123',
});
localStorage.setItem('accessToken', response.data.data.accessToken);
localStorage.setItem('refreshToken', response.data.data.refreshToken);

// Register course
await api.post('/registrations/register', { courseId });

// Get my grades
const grades = await api.get('/grades/my-grades');
```

## 📈 Reports

### Available Reports

1. **Enrollment Report** (Admin)
   - Total enrolled students
   - Breakdown by department and course
   - Capacity analysis

2. **Academic Performance** (Admin)
   - GPA distribution
   - Pass/fail rates
   - Top and struggling students

3. **Department Statistics** (Admin)
   - Student and faculty counts
   - Course counts
   - Average GPA

4. **Course Performance** (Lecturer/Admin)
   - Enrollment metrics
   - Grade distribution
   - Class average

5. **Student Performance** (All roles)
   - Complete transcript
   - All grades and GPA
   - Course history

6. **My Performance** (Student)
   - Personal dashboard
   - My grades and GPA
   - Registered courses

## 🔒 Security

### Authentication
- JWT tokens with 15-minute expiration
- Refresh tokens with 7-day expiration
- Bcrypt password hashing (salt rounds: 10)
- Automatic token invalidation on logout

### Authorization
- Role-Based Access Control (Admin, Lecturer, Student)
- Endpoint-level role checking via @Roles() decorator
- Public routes via @Public() decorator
- Automatic role enforcement via RolesGuard

### Data Protection
- Environment variable validation
- CORS configuration
- Rate limiting (100 requests/minute)
- Soft-delete pattern for audit trails
- Error response sanitization

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Cloud

**Heroku:**
```bash
heroku create scrs-backend
heroku config:set JWT_SECRET=<your-secret> JWT_REFRESH_SECRET=<your-secret>
git push heroku main
```

**AWS/Azure/GCP:**
- Build Docker image: `docker build -t scrs-backend .`
- Push to container registry
- Deploy with environment variables configured

### Environment Setup
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/SCRS
JWT_SECRET=<secure-32-char-string>
JWT_REFRESH_SECRET=<secure-32-char-string>
CORS_ORIGIN=https://yourdomain.com
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful",
  "statusCode": 200
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure MongoDB is running (`mongod` or Docker) |
| Port 3000 already in use | Change PORT in .env or kill process using port |
| npm install fails | Run `npm cache clean --force` and retry |
| JWT token invalid | Verify JWT_SECRET in .env matches frontend |
| CORS error | Add frontend URL to CORS_ORIGIN in .env |
| 401 Unauthorized | Token expired - use refresh endpoint |
| Registration validation error | Check all 8 validation rules in documentation |

## 📚 Documentation

- **Swagger API Docs:** Available at `/api` when server is running
- **Implementation Summary:** See `IMPLEMENTATION_SUMMARY.md`
- **Complete Artifacts:** Detailed specifications in project resources

## 🤝 Contributing

This is a complete implementation. For modifications:
1. Follow existing code patterns
2. Maintain TypeScript types
3. Update tests
4. Document changes

## 📄 License

UNLICENSED - Private Project

## 📞 Support

For issues or questions:
1. Check Swagger documentation at `/api`
2. Review error messages in response
3. Check logs with `npm run start:dev`
4. Verify environment configuration

---

## Quick Start Summary

```bash
# 1. Install
npm install

# 2. Start MongoDB
mongod

# 3. Create .env from example
copy .env.example .env

# 4. Run development server
npm run start:dev

# 5. Open API docs
# http://localhost:3000/api
```

**Backend is ready for integration with React frontend!**

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** October 30, 2026
