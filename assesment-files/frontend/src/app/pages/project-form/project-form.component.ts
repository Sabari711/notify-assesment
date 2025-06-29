import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
    FormArray,
    ValidatorFn,
    AbstractControl,
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
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
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatIconModule,
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
            status: ['pending', Validators.required],
            startDate: ['', Validators.required],
            endDate: [''],
            budget: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
            manager: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            teamMembers: this.fb.array([])
        });

        // Add custom validator for end date
        this.projectForm.get('endDate')?.setValidators([
            this.endDateValidator
        ]);
    }

    private endDateValidator: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;
        const startDate = this.projectForm?.get('startDate')?.value;
        if (startDate && new Date(control.value) <= new Date(startDate)) {
            return { 'invalidEndDate': true };
        }
        return null;
    };

    private populateForm(project: Project): void {
        this.projectForm.patchValue({
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate ? new Date(project.startDate) : '',
            endDate: project.endDate ? new Date(project.endDate) : '',
            budget: project.budget,
            manager: project.manager
        });

        if (project.teamMembers && project.teamMembers.length > 0) {
            (project.teamMembers as string[]).forEach((member: string) => {
                this.addTeamMember(member);
            });
        }
    }

    get teamMembers(): FormArray {
        return this.projectForm.get('teamMembers') as FormArray;
    }

    addTeamMember(member: string = ''): void {
        const teamMemberControl = this.fb.control(member, [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50)
        ]);
        this.teamMembers.push(teamMemberControl);
    }

    removeTeamMember(index: number): void {
        this.teamMembers.removeAt(index);
    }

    onSubmit(): void {
        if (this.projectForm.valid) {
            this.loading = true;
            const projectData: Project = {
                ...this.projectForm.value,
                teamMembers: this.teamMembers.value.filter((member: string) => member.trim() !== '')
            };

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
            if (control.errors['min']) {
                return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['min'].min}`;
            }
            if (control.errors['pattern']) {
                if (controlName === 'budget') {
                    return 'Please enter a valid budget amount';
                }
            }
            if (control.errors['invalidEndDate']) {
                return 'End date must be after start date';
            }
        }
        return '';
    }

    getTeamMemberErrorMessage(index: number): string {
        const control = this.teamMembers.at(index);
        if (control?.errors) {
            if (control.errors['required']) {
                return 'Team member name is required';
            }
            if (control.errors['minlength']) {
                return 'Team member name must be at least 2 characters';
            }
            if (control.errors['maxlength']) {
                return 'Team member name must not exceed 50 characters';
            }
        }
        return '';
    }
}
