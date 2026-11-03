import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel('Notification') private notificationModel: Model<any>) {}

  async create(userId: string, title: string, message: string, type: string = 'info') {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      message,
      type,
      isRead: false,
    });

    await notification.save();
    return notification;
  }

  async getByUser(userId: string, page: number = 1, limit: number = 20) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const count = await this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });

    return { unreadCount: count };
  }

  async markAsRead(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification ID');
    }

    const notification = await this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    );

    return { success: true, message: 'All notifications marked as read' };
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification ID');
    }

    await this.notificationModel.findByIdAndDelete(id);
    return { success: true, message: 'Notification deleted' };
  }

  async deleteOldNotifications(daysOld: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.notificationModel.deleteMany({ createdAt: { $lt: date } });
    return { deletedCount: result.deletedCount };
  }
}
