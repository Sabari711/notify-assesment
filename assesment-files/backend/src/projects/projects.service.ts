import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto, ProjectResponseDto, QueryProjectDto, PaginatedProjectsResponseDto } from '../common/dto/project.dto';
import { NotificationService } from '../websocket/notification.service';
import { NotificationType } from '../common/dto/notification.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
        private notificationService: NotificationService,
    ) { }

    async create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectResponseDto> {
        const project = new this.projectModel({
            ...createProjectDto,
            createdBy: userId,
        });

        const savedProject = await project.save();
        const projectResponse = await this.mapToResponseDto(savedProject);

        // Send notification
        this.notificationService.notifyAll({
            type: NotificationType.PROJECT_CREATED,
            message: `New project "${projectResponse.name}" has been created`,
            data: projectResponse,
            timestamp: new Date(),
        });

        return projectResponse;
    }

    async findAll(query: QueryProjectDto): Promise<PaginatedProjectsResponseDto> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search, status } = query;

        // Build filter conditions
        const filter: any = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { manager: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            filter.status = status;
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        const [projects, total] = await Promise.all([
            this.projectModel
                .find(filter)
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.projectModel.countDocuments(filter).exec()
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            data: projects.map(project => this.mapToResponseDto(project)),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev
            }
        };
    }

    async findOne(id: string): Promise<ProjectResponseDto> {
        const project = await this.projectModel
            .findById(id)
            .populate('createdBy', 'name email')
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.mapToResponseDto(project);
    }

    async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<ProjectResponseDto> {
        const project = await this.projectModel.findById(id).exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user is admin or the creator of the project
        if (project.createdBy.toString() !== userId) {
            throw new NotFoundException('You can only update your own projects');
        }

        const updatedProject = await this.projectModel
            .findByIdAndUpdate(id, updateProjectDto, { new: true })
            .populate('createdBy', 'name email')
            .exec();

        const projectResponse = this.mapToResponseDto(updatedProject);

        // Send notification
        this.notificationService.notifyAll({
            type: NotificationType.PROJECT_UPDATED,
            message: `Project "${projectResponse.name}" has been updated`,
            data: projectResponse,
            timestamp: new Date(),
        });

        return projectResponse;
    }

    async remove(id: string, userId: string): Promise<void> {
        const project = await this.projectModel.findById(id).exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user is admin or the creator of the project
        if (project.createdBy.toString() !== userId) {
            throw new NotFoundException('You can only delete your own projects');
        }

        const projectName = project.name;
        await this.projectModel.findByIdAndDelete(id).exec();

        // Send notification
        this.notificationService.notifyAll({
            type: NotificationType.PROJECT_DELETED,
            message: `Project "${projectName}" has been deleted`,
            data: { id },
            timestamp: new Date(),
        });
    }

    private mapToResponseDto(project: ProjectDocument): ProjectResponseDto {
        return {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            budget: project.budget,
            manager: project.manager,
            teamMembers: project.teamMembers || [],
            createdBy: project.createdBy.toString(),
            createdAt: project.createdAt || new Date(),
            updatedAt: project.updatedAt || new Date(),
        };
    }
} 