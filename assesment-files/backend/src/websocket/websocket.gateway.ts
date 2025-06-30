import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private notificationService: NotificationService) { }

    afterInit(server: Server) {
        console.log('🚀 WebSocket Gateway initialized');
        this.notificationService.setServer(server);
    }

    handleConnection(client: Socket) {
        console.log(`✅ Client connected: ${client.id}`);

        // Join the general room for notifications
        client.join('general');

        // Send welcome message
        client.emit('connected', {
            message: 'Connected to notification service',
            clientId: client.id,
        });

        // Log total connected clients
        console.log(`📊 Total connected clients: ${this.server.sockets.sockets.size}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`❌ Client disconnected: ${client.id}`);
        console.log(`📊 Total connected clients: ${this.server.sockets.sockets.size}`);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() room: string,
    ) {
        console.log(`👥 Client ${client.id} joining room: ${room}`);
        client.join(room);
        client.emit('joinedRoom', { room });
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() room: string,
    ) {
        console.log(`👋 Client ${client.id} leaving room: ${room}`);
        client.leave(room);
        client.emit('leftRoom', { room });
    }
} 