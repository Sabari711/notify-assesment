import { Controller, Post, Body, HttpCode, HttpStatus, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginUserDto } from '../common/dto/user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return this.authService.login({
            email: createUserDto.email,
            password: createUserDto.password,
        });
    }
    @Get('user-type')
    async findUserType(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Bearer token is required');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        return this.authService.findUserType(token);
    }
} 