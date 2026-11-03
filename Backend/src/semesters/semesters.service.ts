import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface CreateSemesterInput {
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  registrationOpenDate: Date | string;
  registrationCloseDate: Date | string;
  status?: string;
}

@Injectable()
export class SemestersService {
  constructor(@InjectModel('Semester') private semesterModel: Model<any>) {}

  /**
   * Create a new semester
   */
  async create(input: CreateSemesterInput) {
    const newSemester = new this.semesterModel({
      name: input.name,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      registrationOpenDate: new Date(input.registrationOpenDate),
      registrationCloseDate: new Date(input.registrationCloseDate),
      status: input.status || 'upcoming',
    });

    await newSemester.save();
    return newSemester;
  }

  /**
   * Find semester by ID
   */
  async findById(id: string) {
    const semester = await this.semesterModel.findById(id);

    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    return semester;
  }

  /**
   * Find all semesters
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.semesterModel.find().sort({ startDate: -1 }).skip(skip).limit(limit),
      this.semesterModel.countDocuments(),
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
   * Get active semester
   */
  async getActive() {
    const semester = await this.semesterModel.findOne({ status: 'active' });

    if (!semester) {
      throw new NotFoundException('No active semester found');
    }

    return semester;
  }

  /**
   * Update semester
   */
  async update(id: string, updateData: Partial<CreateSemesterInput>) {
    const semester = await this.semesterModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        ...(updateData.registrationOpenDate && {
          registrationOpenDate: new Date(updateData.registrationOpenDate),
        }),
        ...(updateData.registrationCloseDate && {
          registrationCloseDate: new Date(updateData.registrationCloseDate),
        }),
      },
      { new: true, runValidators: true },
    );

    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    return semester;
  }

  /**
   * Change semester status
   */
  async changeStatus(id: string, status: string) {
    if (!['upcoming', 'active', 'closed'].includes(status)) {
      throw new BadRequestException('Invalid status. Must be: upcoming, active, or closed');
    }

    const semester = await this.semesterModel.findByIdAndUpdate(id, { status }, { new: true });

    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    return semester;
  }

  /**
   * Check if registration is open for semester
   */
  async isRegistrationOpen(semesterId: string): Promise<boolean> {
    const semester = await this.semesterModel.findById(semesterId);

    if (!semester) {
      return false;
    }

    const now = new Date();
    return now >= semester.registrationOpenDate && now <= semester.registrationCloseDate;
  }

  /**
   * Delete semester
   */
  async delete(id: string) {
    const semester = await this.semesterModel.findByIdAndDelete(id);

    if (!semester) {
      throw new NotFoundException('Semester not found');
    }

    return { success: true, message: 'Semester deleted successfully' };
  }
}
