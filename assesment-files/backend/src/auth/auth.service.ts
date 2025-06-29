import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../common/dto/user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string, role?: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            // Check if role matches (if role is provided)
            if (role && user.role !== role) {
                throw new UnauthorizedException(`User does not have ${role} role`);
            }
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto & { role?: string }) {
        const { email, password, role } = loginUserDto;
        const user = await this.validateUser(email, password, role);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user._id, role: user.role };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            message: "Login successful.."
        };
    }

    async findUserType(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            return {
                role: payload.role,
                email: payload.email
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
} 