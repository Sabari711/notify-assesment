import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NotificationDto } from '../common/dto/notification.dto';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class NotificationService {
    @WebSocketServer()
    server: Server;

    notifyAll(notification: NotificationDto) {
        this.server.emit('notification', notification);
    }

    notifyUser(userId: string, notification: NotificationDto) {
        this.server.to(userId).emit('notification', notification);
    }

    notifyRoom(room: string, notification: NotificationDto) {
        this.server.to(room).emit('notification', notification);
    }
} 