import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WebsocketGateway } from './websocket.gateway';

@Module({
    providers: [NotificationService, WebsocketGateway],
    exports: [NotificationService],
})
export class WebsocketModule { } 