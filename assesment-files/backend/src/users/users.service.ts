import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UserResponseDto } from '../common/dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { email, password, name, role } = createUserDto;

        // Check if user already exists
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new this.userModel({
            email,
            password: hashedPassword,
            name,
            role: role || 'viewer',
        });

        const savedUser = await user.save();
        return this.mapToResponseDto(savedUser);
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.mapToResponseDto(user);
    }

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.userModel.find().exec();
        return users.map(user => this.mapToResponseDto(user));
    }

    private mapToResponseDto(user: UserDocument): UserResponseDto {
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt || new Date(),
            updatedAt: user.updatedAt || new Date(),
        };
    }
} 