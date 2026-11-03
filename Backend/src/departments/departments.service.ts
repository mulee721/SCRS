import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface CreateDepartmentInput {
  code: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  officeLocation?: string;
  headId?: string;
}

@Injectable()
export class DepartmentsService {
  constructor(@InjectModel('Department') private departmentModel: Model<any>) {}

  /**
   * Create a new department
   */
  async create(input: CreateDepartmentInput) {
    // Check if department code already exists
    const existing = await this.departmentModel.findOne({
      code: input.code.toUpperCase(),
    });

    if (existing) {
      throw new ConflictException('Department code already exists');
    }

    // Validate headId if provided
    if (input.headId && !Types.ObjectId.isValid(input.headId)) {
      throw new BadRequestException('Invalid head ID');
    }

    const newDept = new this.departmentModel({
      code: input.code.toUpperCase(),
      name: input.name,
      description: input.description,
      phoneNumber: input.phoneNumber,
      officeLocation: input.officeLocation,
      ...(input.headId && { headId: new Types.ObjectId(input.headId) }),
    });

    await newDept.save();
    return newDept.populate('headId', 'name email title');
  }

  /**
   * Find department by ID
   */
  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const dept = await this.departmentModel.findById(id).populate('headId', 'name email title');

    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    return dept;
  }

  /**
   * Find all departments
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.departmentModel
        .find()
        .populate('headId', 'name email title')
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit),
      this.departmentModel.countDocuments(),
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
   * Update department
   */
  async update(id: string, updateData: Partial<CreateDepartmentInput>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    // Check if code is being changed and if new code exists
    if (updateData.code) {
      const existing = await this.departmentModel.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: new Types.ObjectId(id) },
      });

      if (existing) {
        throw new ConflictException('Department code already exists');
      }
    }

    if (updateData.headId && !Types.ObjectId.isValid(updateData.headId)) {
      throw new BadRequestException('Invalid head ID');
    }

    const dept = await this.departmentModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(updateData.code && { code: updateData.code.toUpperCase() }),
        ...(updateData.headId && { headId: new Types.ObjectId(updateData.headId) }),
      },
      { new: true, runValidators: true },
    );

    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    return dept.populate('headId', 'name email title');
  }

  /**
   * Delete department
   */
  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid department ID');
    }

    const dept = await this.departmentModel.findByIdAndDelete(id);

    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    return { success: true, message: 'Department deleted successfully' };
  }
}
