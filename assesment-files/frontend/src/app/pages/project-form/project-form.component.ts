import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MatDialog,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MAT_DIALOG_DATA,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

import { ProjectApiService, Project } from '../../_services/project-api.service';

@Component({
    selector: 'app-project-form',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatSelectModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './project-form.component.html',
    styleUrl: './project-form.component.css'
})
export class ProjectFormComponent implements OnInit {
    projectForm!: FormGroup;
    isEdit = false;
    loading = false;

    statusOptions = [
        { value: 'pending', viewValue: 'Pending' },
        { value: 'active', viewValue: 'Active' },
        { value: 'completed', viewValue: 'Completed' }
    ];

    constructor(
        private fb: FormBuilder,
        private projectService: ProjectApiService,
        private toastr: ToastrService,
        @Inject(MAT_DIALOG_DATA) public data: { project?: Project; isEdit: boolean },
        private dialogRef: MatDialogRef<ProjectFormComponent>
    ) {
        this.isEdit = data.isEdit;
    }

    ngOnInit(): void {
        this.initForm();
        if (this.isEdit && this.data.project) {
            this.populateForm(this.data.project);
        }
    }

    

    private initForm(): void {
        this.projectForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
            status: ['pending', Validators.required]
        });
    }

    private populateForm(project: Project): void {
        this.projectForm.patchValue({
            name: project.name,
            description: project.description,
            status: project.status
        });
    }

    onSubmit(): void {
        if (this.projectForm.valid) {
            this.loading = true;
            const projectData: Project = this.projectForm.value;

            if (this.isEdit && this.data.project?.id) {
                this.projectService.updateProject(this.data.project.id, projectData).subscribe({
                    next: (result) => {
                        this.loading = false;
                        this.toastr.success('Project updated successfully');
                        this.dialogRef.close(result);
                    },
                    error: (error) => {
                        this.loading = false;
                        this.toastr.error(error.error?.message || 'Failed to update project');
                        console.error('Error updating project:', error);
                    }
                });
            } else {
                this.projectService.createProject(projectData).subscribe({
                    next: (result) => {
                        this.loading = false;
                        this.toastr.success('Project created successfully');
                        this.dialogRef.close(result);
                    },
                    error: (error) => {
                        this.loading = false;
                        this.toastr.error(error.error?.message || 'Failed to create project');
                        console.error('Error creating project:', error);
                    }
                });
            }
        } else {
            this.markFormGroupTouched();
            this.toastr.warning('Please fill all required fields correctly');
        }
    }

    private markFormGroupTouched(): void {
        Object.keys(this.projectForm.controls).forEach(key => {
            const control = this.projectForm.get(key);
            control?.markAsTouched();
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    getErrorMessage(controlName: string): string {
        const control = this.projectForm.get(controlName);
        if (control?.errors) {
            if (control.errors['required']) {
                return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
            }
            if (control.errors['minlength']) {
                return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
            }
            if (control.errors['maxlength']) {
                return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
            }
        }
        return '';
    }
}
