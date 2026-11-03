import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

interface CreateLecturerInput {
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  title: string;
  qualification?: string;
  officeLocation?: string;
  password: string; // required — admin must set initial password
}

@Injectable()
export class LecturersService {
  constructor(
    @InjectModel('Lecturer') private lecturerModel: Model<any>,
    private usersService: UsersService,
  ) {}

  /**
   * Create a new lecturer + their login account (admin only)
   */
  async create(input: CreateLecturerInput) {
    // Check if lecturer email already exists
    const existing = await this.lecturerModel.findOne({
      email: input.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException('A lecturer with this email already exists');
    }

    if (!Types.ObjectId.isValid(input.departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    // 1. Create the user account first so we have a real userId
    const username = input.email.split('@')[0].toLowerCase();
    const user = await this.usersService.create(
      input.email,
      username,
      input.password,
      Role.LECTURER,
      'temp', // will update after lecturer is created
    );

    // 2. Create the lecturer document with the real userId
    const newLecturer = new this.lecturerModel({
      userId: user._id,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      departmentId: new Types.ObjectId(input.departmentId),
      title: input.title,
      qualification: input.qualification,
      isActive: true,
      officeLocation: input.officeLocation,
    });
    await newLecturer.save();

    // 3. Update user's refId to point to the lecturer document
    await this.usersService.updateRefId(user._id.toString(), newLecturer._id.toString());

    return newLecturer.populate('departmentId', 'code name');
  }

  /**
   * Find lecturer by ID
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid lecturer ID');
    }

    const lecturer = await this.lecturerModel.findById(id).populate('departmentId', 'code name');

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    return lecturer;
  }

  /**
   * Find all lecturers
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.lecturerModel
        .find({ isActive: true })
        .populate('departmentId', 'code name')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      this.lecturerModel.countDocuments({ isActive: true }),
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
   * Find lecturers by department
   */
  async findByDepartment(departmentId: string) {
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    return this.lecturerModel
      .find({
        departmentId: new Types.ObjectId(departmentId),
        isActive: true,
      })
      .populate('departmentId', 'code name')
      .sort({ name: 1 });
  }

  /**
   * Update lecturer
   */
  async update(id: string, updateData: Partial<CreateLecturerInput>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid lecturer ID');
    }

    if (updateData.departmentId && !Types.ObjectId.isValid(updateData.departmentId)) {
      throw new BadRequestException('Invalid department ID');
    }

    const lecturer = await this.lecturerModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(updateData.departmentId && {
          departmentId: new Types.ObjectId(updateData.departmentId),
        }),
      },
      { new: true, runValidators: true },
    );

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    return lecturer.populate('departmentId', 'code name');
  }

  /**
   * Deactivate lecturer
   */
  async deactivate(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid lecturer ID');
    }

    const lecturer = await this.lecturerModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    return lecturer;
  }
}
