import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RegistrationValidator } from './validators/registration.validator';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel('Registration') private registrationModel: Model<any>,
    @InjectModel('Course') private courseModel: Model<any>,
    private validator: RegistrationValidator,
    private coursesService: CoursesService,
  ) {}

  /**
   * Register student for course
   */
  async register(studentId: string, courseId: string, semesterId: string) {
    // Validate all registration rules
    const validationError = await this.validator.validate(studentId, courseId, semesterId);
    if (validationError) {
      throw new ConflictException(validationError);
    }

    // Create registration (status depends on system config)
    const registration = new this.registrationModel({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
      semesterId: new Types.ObjectId(semesterId),
      status: 'approved', // Can be changed to 'pending' if approval required
      registrationDate: new Date(),
    });

    await registration.save();

    // Increment course enrolled count
    await this.coursesService.incrementEnrolled(courseId);

    return {
      success: true,
      message: 'Course registered successfully',
      data: await this.findById(registration._id.toString()),
    };
  }

  /**
   * Find registration by ID
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid registration ID');
    }

    const registration = await this.registrationModel
      .findById(id)
      .populate('studentId', 'name email registrationNumber')
      .populate('courseId', 'code title credits')
      .populate('semesterId', 'name status');

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  /**
   * Get student's registrations
   */
  async getStudentRegistrations(studentId: string, semesterId?: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    const query: any = {
      studentId: new Types.ObjectId(studentId),
      status: { $in: ['pending', 'approved'] },
    };

    if (semesterId) {
      if (!Types.ObjectId.isValid(semesterId)) {
        throw new BadRequestException('Invalid semester ID');
      }
      query.semesterId = new Types.ObjectId(semesterId);
    }

    const registrations = await this.registrationModel
      .find(query)
      .populate('courseId', 'code title credits department slots')
      .populate('semesterId', 'name status')
      .sort({ registrationDate: -1 });

    // Calculate total credits
    const totalCredits = await Promise.all(
      registrations.map(async (reg) => {
        const course = await this.courseModel.findById(reg.courseId);
        return course?.credits || 0;
      }),
    );

    const creditSum = totalCredits.reduce((a, b) => a + b, 0);

    return {
      success: true,
      data: registrations,
      summary: {
        totalRegistered: registrations.length,
        totalCredits: creditSum,
      },
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query = { status: { $in: ['pending', 'approved'] } };
    const [data, total] = await Promise.all([
      this.registrationModel
        .find(query)
        .populate('studentId', 'name email registrationNumber')
        .populate('courseId', 'code title credits')
        .populate('semesterId', 'name status')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(limit),
      this.registrationModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get course registrations (lecturer/admin view)
   */
  async getCourseRegistrations(courseId: string, page: number = 1, limit: number = 20) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.registrationModel
        .find({
          courseId: new Types.ObjectId(courseId),
          status: { $in: ['pending', 'approved'] },
        })
        .populate('studentId', 'name email registrationNumber')
        .populate('courseId', 'code title')
        .sort({ registrationDate: -1 })
        .skip(skip)
        .limit(limit),
      this.registrationModel.countDocuments({
        courseId: new Types.ObjectId(courseId),
        status: { $in: ['pending', 'approved'] },
      }),
    ]);

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Drop course
   */
  async drop(registrationId: string, studentId: string) {
    if (!Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestException('Invalid registration ID');
    }

    const registration = await this.registrationModel.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Verify ownership
    if (registration.studentId.toString() !== studentId) {
      throw new BadRequestException('You can only drop your own registrations');
    }

    // Update registration status
    registration.status = 'dropped';
    registration.dropDate = new Date();
    await registration.save();

    // Decrement course enrolled count
    await this.coursesService.decrementEnrolled(registration.courseId.toString());

    return {
      success: true,
      message: 'Course dropped successfully',
      data: registration,
    };
  }

  /**
   * Approve registration (if approval required)
   */
  async approve(registrationId: string, adminId: string) {
    if (!Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestException('Invalid registration ID');
    }

    const registration = await this.registrationModel.findByIdAndUpdate(
      registrationId,
      {
        status: 'approved',
        approvalDate: new Date(),
        approvedBy: new Types.ObjectId(adminId),
      },
      { new: true },
    );

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return {
      success: true,
      message: 'Registration approved',
      data: registration,
    };
  }

  /**
   * Reject registration
   */
  async reject(registrationId: string) {
    if (!Types.ObjectId.isValid(registrationId)) {
      throw new BadRequestException('Invalid registration ID');
    }

    const registration = await this.registrationModel.findById(registrationId);

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // If already approved, decrement course enrollment
    if (registration.status === 'approved') {
      await this.coursesService.decrementEnrolled(registration.courseId.toString());
    }

    registration.status = 'rejected';
    await registration.save();

    return {
      success: true,
      message: 'Registration rejected',
      data: registration,
    };
  }

  /**
   * Get student's timetable
   */
  async getStudentTimetable(studentId: string, semesterId: string) {
    if (!Types.ObjectId.isValid(studentId)) {
      throw new BadRequestException('Invalid student ID');
    }

    if (!Types.ObjectId.isValid(semesterId)) {
      throw new BadRequestException('Invalid semester ID');
    }

    const registrations = await this.registrationModel
      .find({
        studentId: new Types.ObjectId(studentId),
        semesterId: new Types.ObjectId(semesterId),
        status: 'approved',
      })
      .populate({
        path: 'courseId',
        select: 'code title slots room',
        populate: {
          path: 'lecturerId',
          select: 'name email',
        },
      });

    // Format timetable by day
    const timetable: Record<string, any[]> = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
    };

    for (const reg of registrations) {
      if (reg.courseId.slots && reg.courseId.slots.length > 0) {
        for (const slot of reg.courseId.slots) {
          const day = slot.day as keyof typeof timetable;
          timetable[day].push({
            courseCode: reg.courseId.code,
            title: reg.courseId.title,
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room,
            lecturer: reg.courseId.lecturerId,
          });
        }
      }
    }

    // Sort each day by time
    for (const day in timetable) {
      timetable[day as keyof typeof timetable].sort((a, b) => a.startTime - b.startTime);
    }

    return {
      success: true,
      data: timetable,
    };
  }

  /**
   * Get registration statistics
   */
  async getStatistics(semesterId?: string) {
    const query: any = { status: { $in: ['pending', 'approved'] } };

    if (semesterId) {
      if (!Types.ObjectId.isValid(semesterId)) {
        throw new BadRequestException('Invalid semester ID');
      }
      query.semesterId = new Types.ObjectId(semesterId);
    }

    const totalRegistrations = await this.registrationModel.countDocuments(query);
    const pendingRegistrations = await this.registrationModel.countDocuments({
      ...query,
      status: 'pending',
    });
    const approvedRegistrations = await this.registrationModel.countDocuments({
      ...query,
      status: 'approved',
    });
    const droppedRegistrations = await this.registrationModel.countDocuments({
      status: 'dropped',
    });

    return {
      success: true,
      data: {
        totalRegistrations,
        pendingRegistrations,
        approvedRegistrations,
        droppedRegistrations,
      },
    };
  }
}
