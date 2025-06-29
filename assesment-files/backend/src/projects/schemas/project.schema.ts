import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ default: 'pending' })
    status: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop({ required: true, min: 0 })
    budget: number;

    @Prop({ required: true })
    manager: string;

    @Prop({ type: [String], default: [] })
    teamMembers: string[];

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project); 