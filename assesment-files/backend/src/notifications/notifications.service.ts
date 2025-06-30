import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import {
    CreateNotificationDto,
    NotificationResponseDto,
    QueryNotificationDto
} from '../common/dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    ) { }

    // Create a notification (no user context, so read: false)
    async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
        const notification = new this.notificationModel({
            ...createNotificationDto,
            timestamp: new Date(),
        });
        const saved = await notification.save();
        return {
            id: saved._id.toString(),
            type: saved.type,
            message: saved.message,
            data: saved.data,
            timestamp: saved.timestamp,
            read: false,
            userId: saved.userId?.toString(),
            createdAt: saved.createdAt || new Date(),
            updatedAt: saved.updatedAt || new Date(),
        };
    }

    // Get all notifications for a user (not deleted by user)
    async findAllForUser(userId: string, query: QueryNotificationDto) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const filter: any = { deletedBy: { $ne: userId } };
        const [notifications, total] = await Promise.all([
            this.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.notificationModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: notifications.map(n => this.mapToResponseDtoForUser(n, userId)),
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };
    }

    // Get a single notification for a user
    async findOneForUser(id: string, userId: string) {
        console.log(id,"aaaid",userId,"userId")
        const n = await this.notificationModel.findOne({ _id: id, deletedBy: { $ne: userId } });
        if (!n) throw new NotFoundException('Notification not found');
        return this.mapToResponseDtoForUser(n, userId);
    }

    // Mark as read for a user
    async markAsRead(id: string, userId: string) {
        await this.notificationModel.updateOne(
            { _id: id, deletedBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );
        return { message: 'Notification marked as read' };
    }

    // Mark all as read for a user
    async markAllAsRead(userId: string) {
        await this.notificationModel.updateMany(
            { readBy: { $ne: userId }, deletedBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );
        return { message: 'All notifications marked as read' };
    }

    // Delete a notification for a user
    async remove(id: string, userId: string) {
        await this.notificationModel.updateOne(
            { _id: id },
            { $addToSet: { deletedBy: userId } }
        );
        return { message: 'Notification deleted for user' };
    }

    // Clear all notifications for a user
    async clearAll(userId: string) {
        await this.notificationModel.updateMany(
            { deletedBy: { $ne: userId } },
            { $addToSet: { deletedBy: userId } }
        );
        return { message: 'All notifications cleared for user' };
    }

    // Get unread count for a user
    async getUnreadCount(userId: string) {
        return this.notificationModel.countDocuments({
            readBy: { $ne: userId },
            deletedBy: { $ne: userId }
        });
    }

    // Get only unread notifications for a user (not deleted and not read)
    async findUnreadForUser(userId: string, query: QueryNotificationDto) {
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const filter: any = { readBy: { $ne: userId }, deletedBy: { $ne: userId } };
        const [notifications, total] = await Promise.all([
            this.notificationModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.notificationModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: notifications.map(n => this.mapToResponseDtoForUser(n, userId)),
            pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
        };
    }

    // Helper: map notification to response for user
    private mapToResponseDtoForUser(n: NotificationDocument, userId: string): NotificationResponseDto {
        return {
            id: n._id.toString(),
            type: n.type,
            message: n.message,
            data: n.data,
            timestamp: n.timestamp,
            read: n.readBy.map(id => id.toString()).includes(userId),
            userId: n.userId?.toString(),
            createdAt: n.createdAt || new Date(),
            updatedAt: n.updatedAt || new Date(),
        };
    }
} 