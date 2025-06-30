import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { WebsocketModule } from './websocket/websocket.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb+srv://sabari:XIM4Zfk2p9a5G8xi@cluster0.5nqc6.mongodb.net/SC_assesment'),
        AuthModule,
        UsersModule,
        ProjectsModule,
        WebsocketModule,
        NotificationsModule,
    ],
})
export class AppModule { } 