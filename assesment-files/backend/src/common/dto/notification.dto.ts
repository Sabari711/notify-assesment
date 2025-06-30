import { IsOptional, IsInt, Min, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationType {
    PROJECT_CREATED = 'project_created',
    PROJECT_UPDATED = 'project_updated',
    PROJECT_DELETED = 'project_deleted',
}

export class NotificationDto {
    type: NotificationType;
    message: string;
    data?: any;
    timestamp: Date;
}

export class CreateNotificationDto {
    type: NotificationType;
    message: string;
    data?: any;
    userId?: string; // Optional: for user-specific notifications
}

export class NotificationResponseDto {
    id: string;
    type: NotificationType;
    message: string;
    data?: any;
    timestamp: Date;
    read: boolean;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class QueryNotificationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    read?: boolean;

    @IsOptional()
    @IsString()
    userId?: string;
} 