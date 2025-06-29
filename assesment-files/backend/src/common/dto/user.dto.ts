import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';

export enum UserRole {
    ADMIN = 'admin',
    VIEWER = 'viewer',
}

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    name: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class LoginUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
} 