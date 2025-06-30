import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteConfirmationData {
    projectName: string;
    projectId: string;
}

@Component({
    selector: 'app-delete-confirmation-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule
    ],
    template: `
    <h2 mat-dialog-title class="text-danger">
      <mat-icon>warning</mat-icon>
      Confirm Delete
    </h2>
    
    <mat-dialog-content>
      <p>Are you sure you want to delete the project <strong>"{{ data.projectName }}"</strong>?</p>
      <p class="text-muted">This action cannot be undone.</p>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        Cancel
      </button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        <mat-icon>delete</mat-icon>
        Delete Project
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    mat-dialog-content {
      min-width: 300px;
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class DeleteConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
    ) { }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        this.dialogRef.close(true);
    }
} 