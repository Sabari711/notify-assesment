import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
    Put,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from '../common/dto/project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/dto/user.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createProjectDto: CreateProjectDto, @Request() req) {

        return this.projectsService.create(createProjectDto, req.user.userId);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    findAll(@Query() query: QueryProjectDto, @Request() req: any) {
        return this.projectsService.findAll(query);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.VIEWER)
    findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Request() req) {
        return this.projectsService.update(id, updateProjectDto, req.user.userId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string, @Request() req) {
        return this.projectsService.remove(id, req.user.userId);
    }
} 