import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/dto/user.dto';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: UserRole, default: UserRole.VIEWER })
    role: UserRole;

    createdAt?: Date;
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 