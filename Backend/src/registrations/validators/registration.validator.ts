import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

/**
 * Validates course registration against all business rules
 */
@Injectable()
export class RegistrationValidator {
  constructor(
    @InjectModel('Registration') private registrationModel: Model<any>,
    @InjectModel('Course') private courseModel: Model<any>,
    @InjectModel('Semester') private semesterModel: Model<any>,
    @InjectModel('Student') private studentModel: Model<any>,
    private configService: ConfigService,
  ) {}

  /**
   * Validate all registration rules
   * Returns error message if any rule fails, null if all pass
   */
  async validate(studentId: string, courseId: string, semesterId: string): Promise<string | null> {
    // Rule 1: Check duplicate registration
    const duplicateError = await this.checkDuplicate(studentId, courseId, semesterId);
    if (duplicateError) return duplicateError;

    // Rule 2: Check course capacity
    const capacityError = await this.checkCapacity(courseId);
    if (capacityError) return capacityError;

    // Rule 3: Check credit limit
    const creditError = await this.checkCreditLimit(studentId, courseId, semesterId);
    if (creditError) return creditError;

    // Rule 4: Check timetable conflicts
    const conflictError = await this.checkTimetableConflict(studentId, courseId, semesterId);
    if (conflictError) return conflictError;

    // Rule 5: Check semester registration open
    const semesterError = await this.checkSemesterOpen(semesterId);
    if (semesterError) return semesterError;

    // Rule 6: Check student active
    const studentError = await this.checkStudentActive(studentId);
    if (studentError) return studentError;

    // Rule 7: Check course active
    const courseError = await this.checkCourseActive(courseId);
    if (courseError) return courseError;

    // Rule 8: Check prerequisites (if configured)
    const prerequisiteError = await this.checkPrerequisites(studentId, courseId);
    if (prerequisiteError) return prerequisiteError;

    return null; // All validations passed
  }

  /**
   * Rule 1: Prevent duplicate registrations in same semester
   */
  private async checkDuplicate(
    studentId: string,
    courseId: string,
    semesterId: string,
  ): Promise<string | null> {
    const existing = await this.registrationModel.findOne({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
      semesterId: new Types.ObjectId(semesterId),
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      const course = await this.courseModel.findById(courseId);
      return `You are already registered for ${course.code}.`;
    }

    return null;
  }

  /**
   * Rule 2: Check course has available capacity
   */
  private async checkCapacity(courseId: string): Promise<string | null> {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    if (course.enrolled >= course.capacity) {
      return `${course.code} is full (${course.enrolled}/${course.capacity} seats taken).`;
    }

    return null;
  }

  /**
   * Rule 3: Check credit hour limit (default: 18)
   */
  private async checkCreditLimit(
    studentId: string,
    courseId: string,
    semesterId: string,
  ): Promise<string | null> {
    const creditLimit = this.configService.get<number>('CREDIT_LIMIT') || 18;

    // Get all approved/pending registrations for this student in this semester
    const registrations = await this.registrationModel.find({
      studentId: new Types.ObjectId(studentId),
      semesterId: new Types.ObjectId(semesterId),
      status: { $in: ['pending', 'approved'] },
    });

    // Calculate current credits
    const courseIds = registrations.map((r) => r.courseId);
    const courses = await this.courseModel.find({
      _id: { $in: courseIds },
    });

    let currentCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    // Add credits for the course being registered
    const newCourse = await this.courseModel.findById(courseId);
    currentCredits += newCourse.credits;

    if (currentCredits > creditLimit) {
      const remaining = creditLimit - (currentCredits - newCourse.credits);
      return `Adding ${newCourse.code} (${newCourse.credits} credits) would exceed your limit. You can add up to ${remaining} more credits.`;
    }

    return null;
  }

  /**
   * Rule 4: Check for timetable conflicts
   */
  private async checkTimetableConflict(
    studentId: string,
    courseId: string,
    semesterId: string,
  ): Promise<string | null> {
    // Get the new course
    const newCourse = await this.courseModel.findById(courseId);
    if (!newCourse || !newCourse.slots || newCourse.slots.length === 0) {
      return null; // No slots = no conflict possible
    }

    // Get all registered courses for this student in this semester
    const registrations = await this.registrationModel.find({
      studentId: new Types.ObjectId(studentId),
      semesterId: new Types.ObjectId(semesterId),
      status: { $in: ['pending', 'approved'] },
    });

    const registeredCourseIds = registrations.map((r) => r.courseId);
    const registeredCourses = await this.courseModel.find({
      _id: { $in: registeredCourseIds },
    });

    // Check for overlapping time slots
    for (const registeredCourse of registeredCourses) {
      if (!registeredCourse.slots || registeredCourse.slots.length === 0) {
        continue;
      }

      for (const newSlot of newCourse.slots) {
        for (const regSlot of registeredCourse.slots) {
          // Check if slots overlap (same day and overlapping time)
          if (newSlot.day === regSlot.day) {
            // Slots overlap if: new.start < reg.end AND reg.start < new.end
            if (newSlot.startTime < regSlot.endTime && regSlot.startTime < newSlot.endTime) {
              return `Timetable conflict with ${registeredCourse.code} on ${newSlot.day} ${String(newSlot.startTime).padStart(2, '0')}:00-${String(newSlot.endTime).padStart(2, '0')}:00.`;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Rule 5: Check semester is active and registration is open
   */
  private async checkSemesterOpen(semesterId: string): Promise<string | null> {
    const semester = await this.semesterModel.findById(semesterId);

    if (!semester) {
      throw new BadRequestException('Semester not found');
    }

    if (semester.status !== 'active') {
      return `Registration for ${semester.name} is not available. Current status: ${semester.status}.`;
    }

    const now = new Date();
    if (now < semester.registrationOpenDate) {
      return `Registration for ${semester.name} has not opened yet. Opens on ${semester.registrationOpenDate.toLocaleDateString()}.`;
    }

    if (now > semester.registrationCloseDate) {
      return `Registration for ${semester.name} has closed. Deadline was ${semester.registrationCloseDate.toLocaleDateString()}.`;
    }

    return null;
  }

  /**
   * Rule 6: Check student account is active
   */
  private async checkStudentActive(studentId: string): Promise<string | null> {
    const student = await this.studentModel.findById(studentId);

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    if (!student.isActive) {
      return 'Your student account has been deactivated. Contact your administrator.';
    }

    return null;
  }

  /**
   * Rule 7: Check course is active
   */
  private async checkCourseActive(courseId: string): Promise<string | null> {
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw new BadRequestException('Course not found');
    }

    if (!course.isActive) {
      return `${course.code} is not available for registration.`;
    }

    return null;
  }

  /**
   * Rule 8: Check prerequisites (optional, only if configured)
   */
  private async checkPrerequisites(studentId: string, courseId: string): Promise<string | null> {
    const course = await this.courseModel.findById(courseId);

    if (!course || !course.prerequisites || course.prerequisites.length === 0) {
      return null; // No prerequisites
    }

    // Get all completed registrations for this student
    const completedRegistrations = await this.registrationModel.find({
      studentId: new Types.ObjectId(studentId),
      status: 'approved', // Only count completed courses
    });

    // Get the courses for those registrations
    const completedCourseIds = completedRegistrations.map((r) => r.courseId);

    // Check if student has taken all prerequisites
    for (const prerequisiteId of course.prerequisites) {
      if (!completedCourseIds.some((id) => id.toString() === prerequisiteId.toString())) {
        const prerequisiteCourse = await this.courseModel.findById(prerequisiteId);
        return `You must complete ${prerequisiteCourse.code} before taking this course.`;
      }
    }

    return null;
  }
}
