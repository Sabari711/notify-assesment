import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);

        // Join the general room for notifications
        client.join('general');

        // Send welcome message
        client.emit('connected', {
            message: 'Connected to notification service',
            clientId: client.id,
        });
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() room: string,
    ) {
        client.join(room);
        client.emit('joinedRoom', { room });
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() room: string,
    ) {
        client.leave(room);
        client.emit('leftRoom', { room });
    }
} 