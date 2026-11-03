import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface CreateStudentInput {
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  academicYear: number;
  userId?: string; // Optional, can be set after creation
}

@Injectable()
export class StudentsService {
  constructor(@InjectModel('Student') private studentModel: Model<any>) {}

  /**
   * Create a new student
   */
  async create(input: CreateStudentInput) {
    // Check if student email already exists
    const existingStudent = await this.studentModel.findOne({
      email: input.email.toLowerCase(),
    });

    if (existingStudent) {
      throw new ConflictException('A student with this email already exists');
    }

    // Generate unique registration number
    const registrationNumber = `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Validate department ID
    if (!Types.ObjectId.isValid(input.departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    // Create new student
    const newStudent = new this.studentModel({
      userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      departmentId: new Types.ObjectId(input.departmentId),
      academicYear: input.academicYear,
      registrationNumber,
      isActive: true,
    });

    const student = await newStudent.save();
    return student;
  }

  /**
   * Find student by ID
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student ID');
    }

    const student = await this.studentModel
      .findById(id)
      .populate('departmentId', 'code name')
      .exec();

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  /**
   * Find student by email
   */
  async findByEmail(email: string) {
    return this.studentModel
      .findOne({ email: email.toLowerCase() })
      .populate('departmentId')
      .exec();
  }

  /**
   * Find student by user ID
   */
  async findByUserId(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const student = await this.studentModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('departmentId')
      .exec();

    if (!student) {
      throw new NotFoundException('Student profile not found');
    }

    return student;
  }

  /**
   * Update student profile
   */
  async update(id: string, updateData: Partial<CreateStudentInput>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student ID');
    }

    // Validate department if provided
    if (updateData.departmentId && !Types.ObjectId.isValid(updateData.departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const student = await this.studentModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(updateData.departmentId && {
          departmentId: new Types.ObjectId(updateData.departmentId),
        }),
      },
      { new: true, runValidators: true },
    );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  /**
   * Deactivate student
   */
  async deactivate(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid student ID');
    }

    const student = await this.studentModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  /**
   * List all students with pagination
   */
  async findAll(page: number = 1, limit: number = 10, filter: any = {}) {
    const skip = (page - 1) * limit;

    const query: any = { isActive: true, ...filter };

    const [data, total] = await Promise.all([
      this.studentModel
        .find(query)
        .populate('departmentId', 'code name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.studentModel.countDocuments(query),
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
}
