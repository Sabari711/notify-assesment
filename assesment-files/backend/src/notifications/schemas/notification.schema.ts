import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from '../../common/dto/notification.dto';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ required: true, enum: NotificationType })
    type: NotificationType;

    @Prop({ required: true })
    message: string;

    @Prop({ type: Object })
    data?: any;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    readBy: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    deletedBy: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId?: Types.ObjectId;

    @Prop({ required: true, default: Date.now })
    timestamp: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification); 