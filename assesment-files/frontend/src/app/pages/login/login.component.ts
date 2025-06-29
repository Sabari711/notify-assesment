import { Component, Inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
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
import { ToastrService } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { UserApiService } from '../../_services/user-api.service';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatIcon,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  roles = [
    { value: 'admin', viewValue: 'Admin' },
    { value: 'viewer', viewValue: 'Viewer' }
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private api: UserApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<LoginComponent>
  ) { }

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      ),]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/
          ),
          Validators.maxLength(15),
          Validators.minLength(8),
        ],
      ],
      // role: ['viewer', Validators.required]
    });
  }

  submit() {
    if (this.loginForm.valid) {
      this.loading = true;
      const loginData = this.loginForm.value

      this.api.userLogin(loginData).subscribe({
        next: (result) => {
          this.loading = false;
          // Store token and user role
          localStorage.setItem("userToken", result.access_token);
          // localStorage.setItem("userRole", result.user?.role || this.loginForm.value.role);
          localStorage.setItem("userEmail", result.user?.email || this.loginForm.value.email);

          // this.toastr.success('Login successful!');
          this.dialogRef.close({
            message: result.message,
            data: result.access_token,
            user: result.user
          });
        },
        error: (err) => {
          this.loading = false;
          console.error('Login error:', err);
          const errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
          this.toastr.error(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastr.warning('Please fill all required fields correctly');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['pattern']) {
        if (controlName === 'email') {
          return 'Please enter a valid email address';
        }
        if (controlName === 'password') {
          return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
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
