import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // Use Socket.IO adapter
    app.useWebSocketAdapter(new IoAdapter(app));

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const port = process.env.PORT || 5000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap(); 