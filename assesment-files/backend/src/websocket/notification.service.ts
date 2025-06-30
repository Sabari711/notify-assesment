import { Injectable } from '@nestjs/common';
import { NotificationDto } from '../common/dto/notification.dto';

@Injectable()
export class NotificationService {
    private server: any;

    setServer(server: any) {
        this.server = server;
    }

    notifyAll(notification: NotificationDto) {
        console.log('🔔 Broadcasting notification to all users:', notification);
        if (this.server) {
            this.server.emit('notification', notification);
        } else {
            console.error('❌ WebSocket server not initialized');
        }
    }

    notifyUser(userId: string, notification: NotificationDto) {
        console.log('🔔 Sending notification to user:', userId, notification);
        if (this.server) {
            this.server.to(userId).emit('notification', notification);
        } else {
            console.error('❌ WebSocket server not initialized');
        }
    }

    notifyRoom(room: string, notification: NotificationDto) {
        console.log('🔔 Sending notification to room:', room, notification);
        if (this.server) {
            this.server.to(room).emit('notification', notification);
        } else {
            console.error('❌ WebSocket server not initialized');
        }
    }
} 