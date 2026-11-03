# SCRS System - Quick Start Guide

## 🚀 Start Development in 5 Minutes

### 1. Prerequisites Check
```bash
node --version      # Should be >= 20.20.2
npm --version       # Should be >= 10.8.2
mongod --version    # Should be >= 5.0
```

### 2. MongoDB Running
```bash
# Option A: Local MongoDB
mongod

# Option B: MongoDB Atlas
# Already hosted, just update MONGODB_URI in Backend/.env
```

### 3. Backend Setup
```bash
cd Backend
npm install
cp .env.example .env

# Edit .env - Set these critical values:
# MONGODB_URI=mongodb://localhost:27017/scrs
# JWT_SECRET=your_32_char_random_string_here
# JWT_REFRESH_SECRET=another_32_char_random_string

npm run start:dev
# 🎉 Backend running on http://localhost:3000
# 📚 API docs at http://localhost:3000/api/docs
```

### 4. Frontend Setup (New Terminal)
```bash
cd Frontend
npm install
npm run dev
# 🎉 Frontend running on http://localhost:5173
```

### 5. Test Registration Flow
1. Open http://localhost:5173
2. Register: test@university.edu / password123
3. Login with same credentials
4. View your profile
5. ✅ System working!

---

## 🧪 Quick Integration Test

```bash
# In Backend directory:
npm run build           # Verify compilation
npx ts-node test-simple.ts  # Run integration tests

# Expected output:
# ✅ Health endpoint responds
# ✅ Get departments (public endpoint)
# ✅ Register new student
# ✅ Login with email and password
# ✅ Get current user profile
# ✅ Get student profile
```

---

## 📚 Essential Commands

### Backend
```bash
npm run start:dev       # Development mode (auto-reload)
npm run build           # Production build
npm run start:prod      # Production mode
npm test                # Run tests
npm run lint            # Check code style
npm run format          # Auto-format code
```

### Frontend
```bash
npm run dev             # Development mode
npm run build           # Production build
npm run preview         # Preview production build
npm test                # Run tests
npm run lint            # Check code style
```

---

## 🔐 First-Time Setup Steps

### Create Initial Admin Account
```bash
# Login to MongoDB
mongosh

# Use SCRS database
use scrs

# Create admin manually (or use seed script)
db.users.insertOne({
  email: "admin@university.edu",
  username: "admin",
  password: "$2b$10$...", // bcrypt hash
  role: "admin",
  refId: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Create Test Department
```bash
curl -X POST http://localhost:3000/api/v1/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "CS",
    "name": "Computer Science",
    "headId": "admin_user_id"
  }'
```

---

## 🐛 Common Issues & Quick Fixes

### "MongoDB connection refused"
```bash
# Start MongoDB
mongod
# OR update MONGODB_URI in Backend/.env
```

### "Port 3000 already in use"
```bash
# Kill existing process
lsof -i :3000
kill -9 <PID>
# OR change PORT in Backend/.env
```

### "JWT token invalid"
```bash
# Regenerate JWT secrets
# Backend/.env:
JWT_SECRET=generate_new_32_char_string
JWT_REFRESH_SECRET=generate_new_32_char_string
# Restart backend
```

### "CORS errors in browser"
```bash
# Update Backend/.env:
CORS_ORIGIN=http://localhost:5173
# Restart backend
```

### "Email already exists"
```bash
# Register with different email
# Or delete test user from MongoDB:
db.users.deleteOne({email: "test@university.edu"})
db.students.deleteOne({email: "test@university.edu"})
```

---

## 📊 API Quick Reference

### Authentication
```bash
# Register
POST /api/v1/auth/register
{
  "email": "student@university.edu",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "departmentId": "dept_id_here",
  "academicYear": 1
}

# Login
POST /api/v1/auth/login
{
  "identifier": "student@university.edu",
  "password": "SecurePass123!"
}

# Get Profile (with Bearer token)
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Courses
```bash
# List courses
GET /api/v1/courses

# Get available courses
GET /api/v1/courses/available

# Register for course
POST /api/v1/registrations
{
  "courseId": "course_id",
  "semesterId": "semester_id"
}
```

### Grades & Reports
```bash
# Get my grades
GET /api/v1/grades/my-grades
Authorization: Bearer <access_token>

# Get performance report
GET /api/v1/reports/my-performance
Authorization: Bearer <access_token>
```

---

## 🛠️ Development Workflow

### Make a Change
```bash
# Edit code
vim Backend/src/auth/auth.controller.ts

# Backend auto-reloads in dev mode
# Or manually rebuild:
npm run build
```

### Test Changes
```bash
# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
git push origin develop
```

---

## 📈 Performance Tips

### Speed Up Development
```bash
# Use incremental builds
npm run build -- --incremental

# Use watch mode for tests
npm run test:watch

# Clear node_modules cache
rm -rf node_modules/.cache
```

### Speed Up Frontend
```bash
# Faster Vite dev server
npm run dev -- --host

# Build analysis
npm run build -- --analyze
```

### Database Optimization
```bash
# Add indexes
db.users.createIndex({email: 1})
db.students.createIndex({email: 1})
db.registrations.createIndex({studentId: 1})
```

---

## 🔍 Debugging

### Backend Debugging
```bash
# With Node debugger
node --inspect dist/main.js

# Connect Chrome DevTools
# Visit chrome://inspect
```

### View Logs
```bash
# Tail logs
npm run start:dev 2>&1 | tail -f

# Save to file
npm run start:dev > logs.txt 2>&1
```

### Database Debugging
```bash
# MongoDB query profiling
mongosh
db.setProfilingLevel(1)
db.system.profile.find().pretty()
```

---

## 📚 Documentation Links

- Full README: [README.md](./README.md)
- Deployment: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Security: [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
- Integration Tests: [INTEGRATION_TEST_REPORT.md](./INTEGRATION_TEST_REPORT.md)
- Production Checklist: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

## ✅ Success Checklist

After starting the system, verify:
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected (check logs)
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view profile
- [ ] API docs accessible at /api/docs
- [ ] Health check returning 200

---

## 🆘 Need Help?

### Check Documentation
1. [README.md](./README.md) - Full documentation
2. [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) - Security issues
3. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment issues

### Common Commands
```bash
# See all available scripts
npm run

# Check Node version
node --version

# Check npm version
npm --version

# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# View environment
cat Backend/.env
```

### Get Help
1. Check logs: `npm run start:dev`
2. Check error messages carefully
3. Review documentation
4. Check database: `mongosh`
5. Test API manually: `curl http://localhost:3000/api/v1/health`

---

## 🎓 Next Steps

1. **Explore Backend**
   - API endpoints at `/api/docs`
   - Swagger documentation
   - Source code in `Backend/src/`

2. **Customize Frontend**
   - Components in `Frontend/src/components/`
   - Styling with Tailwind
   - Forms with React Hook Form

3. **Add New Features**
   - Create new endpoints
   - Add database models
   - Create UI components

4. **Deploy to Production**
   - Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
   - Run [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
   - Use security best practices from [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)

---

**Happy Coding!** 🚀

**Last Updated:** October 31, 2026  
**Version:** 1.0  
**Status:** Production Ready
