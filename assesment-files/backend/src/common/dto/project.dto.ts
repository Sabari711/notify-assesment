import { IsString, IsOptional, IsIn } from 'class-validator';

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
}

export class ProjectResponseDto {
    id: string;
    name: string;
    description?: string;
    status: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export class QueryProjectDto {
    @IsOptional()
    page?: number = 1;

    @IsOptional()
    limit?: number = 10;

    @IsOptional()
    @IsString()
    @IsIn(['name', 'description', 'status', 'createdAt', 'updatedAt'])
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