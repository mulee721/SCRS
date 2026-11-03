import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface Slot {
  day: string;
  startTime: number;
  endTime: number;
  room: string;
}

interface CreateCourseInput {
  code: string;
  title: string;
  description?: string;
  credits: number;
  departmentId: string;
  semesterId: string;
  lecturerId?: string;
  capacity: number;
  slots?: Slot[];
  prerequisites?: string[];
}

@Injectable()
export class CoursesService {
  constructor(@InjectModel('Course') private courseModel: Model<any>) {}

  /**
   * Create a new course
   */
  async create(input: CreateCourseInput) {
    // Validate course code uniqueness
    const existing = await this.courseModel.findOne({
      code: input.code.toUpperCase(),
    });

    if (existing) {
      throw new ConflictException('Course code already exists');
    }

    // Validate IDs
    if (!Types.ObjectId.isValid(input.departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }
    if (!Types.ObjectId.isValid(input.semesterId)) {
      throw new BadRequestException('Invalid semester ID');
    }
    if (input.lecturerId && !Types.ObjectId.isValid(input.lecturerId)) {
      throw new BadRequestException('Invalid lecturer ID');
    }

    const newCourse = new this.courseModel({
      code: input.code.toUpperCase(),
      title: input.title,
      description: input.description,
      credits: input.credits,
      departmentId: new Types.ObjectId(input.departmentId),
      semesterId: new Types.ObjectId(input.semesterId),
      ...(input.lecturerId && { lecturerId: new Types.ObjectId(input.lecturerId) }),
      capacity: input.capacity,
      enrolled: 0,
      slots: input.slots || [],
      prerequisites: (input.prerequisites || []).map((id) => new Types.ObjectId(id)),
      isActive: true,
    });

    await newCourse.save();
    return newCourse.populate([
      { path: 'departmentId', select: 'code name' },
      { path: 'semesterId', select: 'name status' },
      { path: 'lecturerId', select: 'name email title' },
      { path: 'prerequisites', select: 'code title' },
    ]);
  }

  /**
   * Find course by ID
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel.findById(id).populate([
      { path: 'departmentId', select: 'code name' },
      { path: 'semesterId', select: 'name status' },
      { path: 'lecturerId', select: 'name email title' },
      { path: 'prerequisites', select: 'code title' },
    ]);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  /**
   * Find all courses with filters
   */
  async findAll(page: number = 1, limit: number = 10, filter: any = {}) {
    const skip = (page - 1) * limit;
    const query: any = { isActive: true, ...filter };

    // Validate ObjectId filters
    if (query.departmentId && !Types.ObjectId.isValid(query.departmentId)) {
      delete query.departmentId;
    }
    if (query.semesterId && !Types.ObjectId.isValid(query.semesterId)) {
      delete query.semesterId;
    }
    if (query.lecturerId && !Types.ObjectId.isValid(query.lecturerId)) {
      delete query.lecturerId;
    }

    const [data, total] = await Promise.all([
      this.courseModel
        .find(query)
        .populate([
          { path: 'departmentId', select: 'code name' },
          { path: 'semesterId', select: 'name status' },
          { path: 'lecturerId', select: 'name email title' },
        ])
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit),
      this.courseModel.countDocuments(query),
    ]);

    return {
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
   * Update course
   */
  async update(id: string, updateData: Partial<CreateCourseInput>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }

    // Validate code uniqueness if being changed
    if (updateData.code) {
      const existing = await this.courseModel.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: new Types.ObjectId(id) },
      });

      if (existing) {
        throw new ConflictException('Course code already exists');
      }
    }

    // Validate IDs if provided
    if (updateData.departmentId && !Types.ObjectId.isValid(updateData.departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }
    if (updateData.semesterId && !Types.ObjectId.isValid(updateData.semesterId)) {
      throw new BadRequestException('Invalid semester ID');
    }
    if (updateData.lecturerId && !Types.ObjectId.isValid(updateData.lecturerId)) {
      throw new BadRequestException('Invalid lecturer ID');
    }

    const course = await this.courseModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(updateData.code && { code: updateData.code.toUpperCase() }),
        ...(updateData.departmentId && {
          departmentId: new Types.ObjectId(updateData.departmentId),
        }),
        ...(updateData.semesterId && { semesterId: new Types.ObjectId(updateData.semesterId) }),
        ...(updateData.lecturerId && { lecturerId: new Types.ObjectId(updateData.lecturerId) }),
      },
      { new: true, runValidators: true },
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course.populate([
      { path: 'departmentId', select: 'code name' },
      { path: 'semesterId', select: 'name status' },
      { path: 'lecturerId', select: 'name email title' },
      { path: 'prerequisites', select: 'code title' },
    ]);
  }

  /**
   * Assign lecturer to course
   */
  async assignLecturer(courseId: string, lecturerId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }
    if (!Types.ObjectId.isValid(lecturerId)) {
      throw new BadRequestException('Invalid lecturer ID');
    }

    const course = await this.courseModel.findByIdAndUpdate(
      courseId,
      { lecturerId: new Types.ObjectId(lecturerId) },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course.populate('lecturerId', 'name email title');
  }

  /**
   * Delete course
   */
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.courseModel.findByIdAndDelete(id);

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return { success: true, message: 'Course deleted successfully' };
  }

  /**
   * Increment enrolled count
   */
  async incrementEnrolled(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    return this.courseModel.findByIdAndUpdate(courseId, { $inc: { enrolled: 1 } }, { new: true });
  }

  /**
   * Decrement enrolled count
   */
  async decrementEnrolled(courseId: string) {
    if (!Types.ObjectId.isValid(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    return this.courseModel.findByIdAndUpdate(courseId, { $inc: { enrolled: -1 } }, { new: true });
  }
}
