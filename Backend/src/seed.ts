/**
 * Seed Script - Populate MongoDB with Initial Data
 * Run with: npx ts-node src/seed.ts
 */

import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SCRS';

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('SCRS');

    // Clear existing collections
    console.log('🧹 Clearing existing data...');
    await db.collection('departments').deleteMany({});
    await db.collection('lecturers').deleteMany({});
    await db.collection('students').deleteMany({});
    await db.collection('courses').deleteMany({});
    await db.collection('semesters').deleteMany({});
    await db.collection('users').deleteMany({});
    await db.collection('registrations').deleteMany({});
    await db.collection('announcements').deleteMany({});

    // 1. Create Departments
    console.log('📚 Creating departments...');
    const departments = await db.collection('departments').insertMany([
      {
        code: 'CS',
        name: 'Computer Science',
        head: 'Dr. John Smith',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'ENG',
        name: 'Engineering',
        head: 'Prof. Sarah Williams',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'BUS',
        name: 'Business Administration',
        head: 'Dr. Michael Johnson',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'SCI',
        name: 'Natural Sciences',
        head: 'Dr. Emma Brown',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${departments.insertedCount} departments`);

    // 2. Create Lecturers
    console.log('👨‍🏫 Creating lecturers...');
    const lecturers = await db.collection('lecturers').insertMany([
      {
        name: 'Dr. Robert Taylor',
        email: 'robert.taylor@university.edu',
        phone: '+1-555-0001',
        title: 'Professor',
        qualification: 'Ph.D. Computer Science',
        departmentId: departments.insertedIds[0],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Prof. Lisa Anderson',
        email: 'lisa.anderson@university.edu',
        phone: '+1-555-0002',
        title: 'Associate Professor',
        qualification: 'Ph.D. Engineering',
        departmentId: departments.insertedIds[1],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@university.edu',
        phone: '+1-555-0003',
        title: 'Assistant Professor',
        qualification: 'M.S. Business',
        departmentId: departments.insertedIds[2],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Dr. Patricia Martinez',
        email: 'patricia.martinez@university.edu',
        phone: '+1-555-0004',
        title: 'Professor',
        qualification: 'Ph.D. Physics',
        departmentId: departments.insertedIds[3],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${lecturers.insertedCount} lecturers`);

    // 3. Create Semesters
    console.log('📅 Creating semesters...');
    const semesters = await db.collection('semesters').insertMany([
      {
        name: 'Fall 2026',
        opens: '2026-09-01',
        closes: '2026-12-15',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Spring 2027',
        opens: '2027-01-10',
        closes: '2027-05-20',
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Summer 2027',
        opens: '2027-06-01',
        closes: '2027-08-15',
        status: 'upcoming',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${semesters.insertedCount} semesters`);

    // 4. Create Courses
    console.log('📖 Creating courses...');
    const courses = await db.collection('courses').insertMany([
      {
        code: 'CS101',
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming with Python',
        credits: 3,
        departmentId: departments.insertedIds[0],
        lecturerId: lecturers.insertedIds[0],
        semesterId: semesters.insertedIds[0],
        semester: 1,
        capacity: 40,
        slots: [
          { day: 'Mon', start: 10, end: 12, room: 'A101' },
          { day: 'Wed', start: 10, end: 12, room: 'A101' },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'CS201',
        title: 'Data Structures',
        description: 'Study algorithms and data structures',
        credits: 4,
        departmentId: departments.insertedIds[0],
        lecturerId: lecturers.insertedIds[0],
        semesterId: semesters.insertedIds[0],
        semester: 2,
        capacity: 35,
        slots: [
          { day: 'Tue', start: 14, end: 16, room: 'A202' },
          { day: 'Thu', start: 14, end: 16, room: 'A202' },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'ENG102',
        title: 'Circuit Analysis',
        description: 'Fundamentals of electrical circuits',
        credits: 3,
        departmentId: departments.insertedIds[1],
        lecturerId: lecturers.insertedIds[1],
        semesterId: semesters.insertedIds[0],
        semester: 1,
        capacity: 30,
        slots: [
          { day: 'Mon', start: 13, end: 15, room: 'E301' },
          { day: 'Wed', start: 13, end: 15, room: 'E301' },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'BUS201',
        title: 'Business Management',
        description: 'Principles of modern business management',
        credits: 3,
        departmentId: departments.insertedIds[2],
        lecturerId: lecturers.insertedIds[2],
        semesterId: semesters.insertedIds[0],
        semester: 1,
        capacity: 50,
        slots: [
          { day: 'Tue', start: 9, end: 11, room: 'B101' },
          { day: 'Thu', start: 9, end: 11, room: 'B101' },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'SCI301',
        title: 'Quantum Physics',
        description: 'Advanced concepts in quantum mechanics',
        credits: 4,
        departmentId: departments.insertedIds[3],
        lecturerId: lecturers.insertedIds[3],
        semesterId: semesters.insertedIds[0],
        semester: 2,
        capacity: 25,
        slots: [
          { day: 'Mon', start: 15, end: 17, room: 'S401' },
          { day: 'Fri', start: 15, end: 17, room: 'S401' },
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${courses.insertedCount} courses`);

    // 5. Create Admin User
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    await db.collection('users').insertOne({
      email: 'admin@university.edu',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      refId: 'ADMIN',
      isActive: true,
      lastLogin: new Date(),
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Created admin user`);

    // 6. Create Students
    console.log('👨‍🎓 Creating students...');
    const students = await db.collection('students').insertMany([
      {
        name: 'John Doe',
        email: 'john.doe@university.edu',
        phone: '+1-555-1001',
        departmentId: departments.insertedIds[0],
        academicYear: 1,
        registrationNumber: `STU-2026-${uuidv4().slice(0, 8)}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        phone: '+1-555-1002',
        departmentId: departments.insertedIds[0],
        academicYear: 2,
        registrationNumber: `STU-2026-${uuidv4().slice(0, 8)}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Michael Johnson',
        email: 'michael.johnson@university.edu',
        phone: '+1-555-1003',
        departmentId: departments.insertedIds[1],
        academicYear: 1,
        registrationNumber: `STU-2026-${uuidv4().slice(0, 8)}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sarah Williams',
        email: 'sarah.williams@university.edu',
        phone: '+1-555-1004',
        departmentId: departments.insertedIds[2],
        academicYear: 3,
        registrationNumber: `STU-2026-${uuidv4().slice(0, 8)}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@university.edu',
        phone: '+1-555-1005',
        departmentId: departments.insertedIds[3],
        academicYear: 2,
        registrationNumber: `STU-2026-${uuidv4().slice(0, 8)}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${students.insertedCount} students`);

    // 7. Create Registrations
    console.log('📝 Creating registrations...');
    const registrations = await db.collection('registrations').insertMany([
      {
        studentId: students.insertedIds[0],
        courseId: courses.insertedIds[0],
        status: 'approved',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        studentId: students.insertedIds[1],
        courseId: courses.insertedIds[0],
        status: 'approved',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        studentId: students.insertedIds[2],
        courseId: courses.insertedIds[2],
        status: 'approved',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        studentId: students.insertedIds[3],
        courseId: courses.insertedIds[3],
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        studentId: students.insertedIds[4],
        courseId: courses.insertedIds[4],
        status: 'approved',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${registrations.insertedCount} registrations`);

    // 8. Create Announcements
    console.log('📢 Creating announcements...');
    const announcements = await db.collection('announcements').insertMany([
      {
        title: 'Welcome to the System',
        body: 'Welcome to the Student Course Registration System. Please complete your course registration before the deadline.',
        author: 'Registrar Office',
        audience: 'All',
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Fall 2026 Semester Opens',
        body: 'Registration for Fall 2026 semester is now open. Please register your courses before September 1st.',
        author: 'Registrar Office',
        audience: 'All',
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Important: Grade Report Available',
        body: 'Your grade reports for the previous semester are now available. Please check your student portal.',
        author: 'Registrar Office',
        audience: 'All',
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${announcements.insertedCount} announcements`);

    // Print Summary
    console.log('\n✨ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Departments: ${departments.insertedCount}`);
    console.log(`   • Lecturers: ${lecturers.insertedCount}`);
    console.log(`   • Students: ${students.insertedCount}`);
    console.log(`   • Courses: ${courses.insertedCount}`);
    console.log(`   • Semesters: ${semesters.insertedCount}`);
    console.log(`   • Registrations: ${registrations.insertedCount}`);
    console.log(`   • Announcements: ${announcements.insertedCount}`);
    console.log('\n🔑 Admin Credentials:');
    console.log('   Email: admin@university.edu');
    console.log('   Password: [set via ADMIN_SEED_PASSWORD env var or changed after first login]');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
