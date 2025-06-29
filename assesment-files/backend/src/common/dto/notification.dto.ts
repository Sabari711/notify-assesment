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