import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

interface CreateAnnouncementInput {
  title: string;
  body: string;
  audience: string;
  targetDepartmentId?: string;
  courseId?: string;
  expiryDate?: Date | string;
}

@Injectable()
export class AnnouncementsService {
  constructor(@InjectModel('Announcement') private announcementModel: Model<any>) {}

  async create(input: CreateAnnouncementInput, authorId: string) {
    const announcement = new this.announcementModel({
      title: input.title,
      body: input.body,
      authorId: new Types.ObjectId(authorId),
      audience: input.audience,
      targetDepartmentId: input.targetDepartmentId
        ? new Types.ObjectId(input.targetDepartmentId)
        : null,
      courseId: input.courseId ? new Types.ObjectId(input.courseId) : null,
      isPublished: true,
      publishedDate: new Date(),
      expiryDate: input.expiryDate,
    });

    await announcement.save();
    return announcement.populate('authorId', 'name email');
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid announcement ID');
    }

    const announcement = await this.announcementModel
      .findById(id)
      .populate('authorId', 'name email');

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async findAll(page: number = 1, limit: number = 10, filter: any = {}) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const query: any = {
      isPublished: true,
      ...filter,
      $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }],
    };

    const [data, total] = await Promise.all([
      this.announcementModel
        .find(query)
        .populate('authorId', 'name email')
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit),
      this.announcementModel.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, updateData: Partial<CreateAnnouncementInput>) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid announcement ID');
    }

    const announcement = await this.announcementModel.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(updateData.targetDepartmentId && {
          targetDepartmentId: new Types.ObjectId(updateData.targetDepartmentId),
        }),
        ...(updateData.courseId && { courseId: new Types.ObjectId(updateData.courseId) }),
      },
      { new: true },
    );

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement.populate('authorId', 'name email');
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid announcement ID');
    }

    await this.announcementModel.findByIdAndDelete(id);
    return { success: true, message: 'Announcement deleted' };
  }
}
