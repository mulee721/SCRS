import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface CreateGradeInput {
  score: number;
  feedback?: string;
}

@Injectable()
export class GradesService {
  constructor(
    @InjectModel('Grade') private gradeModel: Model<any>,
    @InjectModel('Registration') private registrationModel: Model<any>,
  ) {}

  /**
   * Enter or update grade for a registration
   */
  async enterGrade(registrationId: string, gradeInput: CreateGradeInput, lecturerId: string) {
    if (!Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestException('Invalid registration ID');
    }

    // Get registration
    const registration = await this.registrationModel
      .findById(registrationId)
      .populate('courseId', 'code title');

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Validate score
    if (gradeInput.score < 0 || gradeInput.score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }

    // Calculate letter grade and points
    const { letter: letterGrade, points: gradePoints } = this.calculateGrade(gradeInput.score);

    // Check if grade already exists
    let grade = await this.gradeModel.findOne({
      registrationId: new Types.ObjectId(registrationId),
    });

    if (grade) {
      // Update existing grade
      grade.score = gradeInput.score;
      grade.letterGrade = letterGrade;
      grade.gradePoints = gradePoints;
      grade.feedback = gradeInput.feedback || '';
      grade.enteredDate = new Date();
      await grade.save();
    } else {
      // Create new grade
      grade = new this.gradeModel({
        registrationId: new Types.ObjectId(registrationId),
        studentId: registration.studentId,
        courseId: registration.courseId,
        lecturerId: new Types.ObjectId(lecturerId),
        score: gradeInput.score,
        letterGrade,
        gradePoints,
        feedback: gradeInput.feedback || '',
        enteredBy: new Types.ObjectId(lecturerId),
        enteredDate: new Date(),
      });

      await grade.save();
    }

    return {
      success: true,
      message: 'Grade recorded successfully',
      data: await this.findById(grade._id.toString()),
    };
  }

  /**
   * Get grade by ID
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid grade ID');
    }

    const grade = await this.gradeModel
      .findById(id)
      .populate('studentId', 'name email registrationNumber')
      .populate('courseId', 'code title credits')
      .populate('lecturerId', 'name email');

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return grade;
  }

  /**
   * Get grade by registration ID
   */
  async findByRegistration(registrationId: string) {
    if (!Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestException('Invalid registration ID');
    }

    const grade = await this.gradeModel
      .findOne({ registrationId: new Types.ObjectId(registrationId) })
      .populate('studentId', 'name email')
      .populate('courseId', 'code title credits');

    if (!grade) {
      throw new NotFoundException('Grade not found for this registration');
    }

    return grade;
  }

  /**
   * Get student grades for a semester
   */
  async getStudentGrades(studentId: string, semesterId?: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    const filter = {
      studentId: new Types.ObjectId(studentId),
      ...(semesterId && Types.ObjectId.isValid(semesterId)
        ? { semesterId: new Types.ObjectId(semesterId) }
        : {}),
    };
    const grades = await this.gradeModel
      .find(filter)
      .populate('courseId', 'code title credits')
      .populate('lecturerId', 'name email')
      .sort({ enteredDate: -1 });

    // Calculate GPA
    const gpa = this.calculateGPA(grades);

    return {
      success: true,
      data: grades,
      summary: {
        totalCourses: grades.length,
        averageScore:
          grades.length > 0
            ? (grades.reduce((sum, g) => sum + g.score, 0) / grades.length).toFixed(2)
            : 0,
        gpa: gpa.toFixed(2),
      },
    };
  }

  /**
   * Get course grades (lecturer view)
   */
  async getCourseGrades(courseId: string, page: number = 1, limit: number = 20) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.gradeModel
        .find({ courseId: new Types.ObjectId(courseId) })
        .populate('studentId', 'name email registrationNumber')
        .sort({ score: -1 })
        .skip(skip)
        .limit(limit),
      this.gradeModel.countDocuments({ courseId: new Types.ObjectId(courseId) }),
    ]);

    // Calculate class statistics
    const allGrades = await this.gradeModel.find({ courseId: new Types.ObjectId(courseId) });
    const scores = allGrades.map((g) => g.score);
    const avg =
      scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const lowest = scores.length > 0 ? Math.min(...scores) : 0;

    return {
      success: true,
      data,
      statistics: {
        average: avg,
        highest,
        lowest,
        count: scores.length,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Calculate letter grade and points
   */
  private calculateGrade(score: number) {
    if (score >= 90) return { letter: 'A', points: 4 };
    if (score >= 85) return { letter: 'A-', points: 3.75 };
    if (score >= 80) return { letter: 'B+', points: 3.5 };
    if (score >= 75) return { letter: 'B', points: 3 };
    if (score >= 70) return { letter: 'C+', points: 2.5 };
    if (score >= 60) return { letter: 'C', points: 2 };
    if (score >= 50) return { letter: 'D', points: 1 };
    return { letter: 'F', points: 0 };
  }

  /**
   * Calculate GPA
   */
  private calculateGPA(grades: any[]): number {
    if (grades.length === 0) return 0;

    const totalPoints = grades.reduce((sum, g) => sum + g.gradePoints, 0);
    return totalPoints / grades.length;
  }

  /**
   * Delete grade
   */
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid grade ID');
    }

    const grade = await this.gradeModel.findByIdAndDelete(id);

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return {
      success: true,
      message: 'Grade deleted successfully',
    };
  }
}
