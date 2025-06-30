import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, QueryNotificationDto } from '../common/dto/notification.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dto/user.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    findAll(@Query() query: QueryNotificationDto, @Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.findAllForUser(userId, query);
    }

    @Get('unread-count')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    getUnreadCount(@Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.getUnreadCount(userId);
    }

    @Get('unread-for-user')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    async getUnreadForUser(@Request() req: any, @Query() query: QueryNotificationDto) {
        const userId = req.user.userId;
        console.log(userId, "--50---userId")
        return this.notificationsService.findUnreadForUser(userId, query);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    findOne(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.findOneForUser(id, userId);
    }

    @Patch(':id/read')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    markAsRead(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.markAsRead(id, userId);
    }

    @Patch('read-all')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    markAllAsRead(@Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.markAllAsRead(userId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    remove(@Param('id') id: string, @Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.remove(id, userId);
    }

    @Delete()
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    clearAll(@Request() req: any) {
        const userId = req.user.userId;
        return this.notificationsService.clearAll(userId);
    }
} 