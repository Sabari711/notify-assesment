import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
    id?: string;
    name: string;
    description?: string;
    status?: 'active' | 'completed' | 'pending';
    startDate: Date | string;
    endDate?: Date | string;
    budget: number;
    manager: string;
    teamMembers: string[];
    createdBy?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface ProjectResponse {
    data: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProjectFilters {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@Injectable({
    providedIn: 'root'
})
export class ProjectApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('userToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Get all projects with filters, search, and pagination
    getAllProjects(filters: ProjectFilters = {}): Observable<ProjectResponse> {
        let params = new HttpParams();

        if (filters.search) {
            params = params.set('search', filters.search);
        }
        if (filters.status) {
            params = params.set('status', filters.status);
        }
        if (filters.page) {
            params = params.set('page', filters.page.toString());
        }
        if (filters.limit) {
            params = params.set('limit', filters.limit.toString());
        }
        if (filters.sortBy) {
            params = params.set('sortBy', filters.sortBy);
        }
        if (filters.sortOrder) {
            params = params.set('sortOrder', filters.sortOrder);
        }

        return this.http.get<ProjectResponse>(`${this.apiUrl}projects`, {
            headers: this.getHeaders(),
            params: params
        });
    }

    // Get project by ID
    getProjectById(id: string): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}projects/${id}`, { headers: this.getHeaders() });
    }

    // Create new project
    createProject(project: Project): Observable<Project> {
        return this.http.post<Project>(`${this.apiUrl}projects`, project, { headers: this.getHeaders() });
    }

    // Update project
    updateProject(id: string, project: Project): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl}projects/${id}`, project, { headers: this.getHeaders() });
    }

    // Delete project
    deleteProject(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}projects/${id}`, { headers: this.getHeaders() });
    }

    // Get project notifications
    getNotifications(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}notifications`, { headers: this.getHeaders() });
    }
}
