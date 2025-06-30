import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ default: 'pending', enum: ['pending', 'active', 'completed'] })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project); 