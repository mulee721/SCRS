import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('Registration') private registrationModel: Model<any>,
    @InjectModel('Course') private courseModel: Model<any>,
    @InjectModel('Student') private studentModel: Model<any>,
    @InjectModel('Grade') private gradeModel: Model<any>,
    @InjectModel('Department') private departmentModel: Model<any>,
  ) {}

  async getEnrollmentReport(semesterId?: string, departmentId?: string) {
    const matchStage: any = { status: { $in: ['pending', 'approved'] } };

    if (semesterId && Types.ObjectId.isValid(semesterId)) {
      matchStage.semesterId = new Types.ObjectId(semesterId);
    }

    const registrations = await this.registrationModel.find(matchStage).populate('courseId');

    let courses = registrations.map((r) => r.courseId);

    if (departmentId && Types.ObjectId.isValid(departmentId)) {
      const deptId = new Types.ObjectId(departmentId);
      courses = courses.filter((c) => c.departmentId.equals(deptId));
    }

    const enrollmentByDept: Record<string, number> = {};
    const enrollmentByCourse: Record<string, number> = {};
    let totalEnrolled = 0;

    for (const course of courses) {
      const deptName = course.code.split(/\d/)[0];
      enrollmentByDept[deptName] = (enrollmentByDept[deptName] || 0) + 1;
      enrollmentByCourse[course.code] = course.enrolled || 0;
      totalEnrolled += course.enrolled || 0;
    }

    return {
      success: true,
      data: {
        totalEnrolled,
        enrollmentByDept,
        enrollmentByCourse,
        timestamp: new Date(),
      },
    };
  }

  async getAcademicReport(semesterId?: string) {
    const matchStage: any = {};
    if (semesterId && Types.ObjectId.isValid(semesterId)) {
      matchStage.semesterId = new Types.ObjectId(semesterId);
    }

    const grades = await this.gradeModel.find().populate('courseId');

    const stats = {
      averageGPA: 0,
      totalStudents: 0,
      gradeDistribution: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        F: 0,
      },
    };

    const uniqueStudents = new Set();
    let totalPoints = 0;

    for (const grade of grades) {
      uniqueStudents.add(grade.studentId.toString());
      totalPoints += grade.gradePoints;

      if (grade.letterGrade.includes('A')) stats.gradeDistribution.A++;
      else if (grade.letterGrade.includes('B')) stats.gradeDistribution.B++;
      else if (grade.letterGrade.includes('C')) stats.gradeDistribution.C++;
      else if (grade.letterGrade.includes('D')) stats.gradeDistribution.D++;
      else stats.gradeDistribution.F++;
    }

    stats.totalStudents = uniqueStudents.size;
    stats.averageGPA = grades.length > 0 ? parseFloat((totalPoints / grades.length).toFixed(2)) : 0;

    return {
      success: true,
      data: stats,
    };
  }

  async getDepartmentReport(departmentId?: string) {
    const query: any = {};
    if (departmentId && Types.ObjectId.isValid(departmentId)) {
      query._id = new Types.ObjectId(departmentId);
    }

    const departments = await this.departmentModel.find(query).populate('headId');

    const reports = [];

    for (const dept of departments) {
      const students = await this.studentModel.countDocuments({
        departmentId: dept._id,
        isActive: true,
      });

      const courses = await this.courseModel.countDocuments({
        departmentId: dept._id,
        isActive: true,
      });

      reports.push({
        department: dept.name,
        code: dept.code,
        head: dept.headId?.name || 'N/A',
        totalStudents: students,
        totalCourses: courses,
      });
    }

    return {
      success: true,
      data: reports,
      timestamp: new Date(),
    };
  }

  async getCoursePerformanceReport(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    const grades = await this.gradeModel.find({
      courseId: new Types.ObjectId(courseId),
    });

    const scores = grades.map((g) => g.score);
    const average =
      scores.length > 0 ? (scores.reduce((a, b) => a + b) / scores.length).toFixed(2) : 0;

    return {
      success: true,
      data: {
        courseCode: course.code,
        courseTitle: course.title,
        totalStudents: grades.length,
        averageScore: average,
        highestScore: Math.max(...scores) || 0,
        lowestScore: Math.min(...scores) || 0,
        passRate:
          ((grades.filter((g) => g.score >= 50).length / grades.length) * 100).toFixed(2) || 0,
      },
    };
  }

  async getStudentPerformanceReport(studentId: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    const grades = await this.gradeModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('courseId', 'code title credits');

    let totalCredits = 0;
    let totalPoints = 0;
    const courses = [];

    for (const grade of grades) {
      totalCredits += grade.courseId.credits;
      totalPoints += grade.gradePoints * grade.courseId.credits;

      courses.push({
        courseCode: grade.courseId.code,
        title: grade.courseId.title,
        credits: grade.courseId.credits,
        score: grade.score,
        letterGrade: grade.letterGrade,
      });
    }

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;

    return {
      success: true,
      data: {
        totalCourses: grades.length,
        totalCredits,
        gpa,
        courses,
      },
    };
  }
}
