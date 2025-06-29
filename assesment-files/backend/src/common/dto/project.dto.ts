import { IsString, IsOptional, IsDateString, IsNumber, IsIn, Min, Max, IsArray, IsDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    @IsIn(['pending', 'active', 'completed'])
    status?: string;

    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;

    @IsNumber()
    @Min(0)
    budget: number;

    @IsString()
    manager: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    teamMembers?: string[];
}

export class UpdateProjectDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    @IsIn(['pending', 'active', 'completed'])
    status?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;

    @IsNumber()
    @Min(0)
    @IsOptional()
    budget?: number;

    @IsString()
    @IsOptional()
    manager?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    teamMembers?: string[];
}

export class ProjectResponseDto {
    id: string;
    name: string;
    description?: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    budget: number;
    manager: string;
    teamMembers: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export class QueryProjectDto {
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @IsIn(['name', 'description', 'status', 'startDate', 'endDate', 'budget', 'manager', 'createdAt', 'updatedAt'])
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsString()
    @IsIn(['asc', 'desc'])
    sortOrder?: string = 'desc';

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    @IsIn(['pending', 'active', 'completed'])
    status?: string;
}

export class PaginatedProjectsResponseDto {
    data: ProjectResponseDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
} 