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
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSelectModule,
    MatIconModule,

  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private api: UserApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SignUpComponent>
  ) { }

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(15),
          Validators.minLength(3),
        ],
      ],
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
      role: ['viewer', [Validators.required]]
    });
  }
  submit() {
    if (this.signUpForm.valid) {
      console.log(this.signUpForm.value, "this.signUpForm.value")
      // return
      this.api.userRegister(this.signUpForm.value).subscribe(
        (result) => {
          console.log(result, 'result');
          this.dialogRef.close({ message: result.message });
        },
        (err) => {
          console.log(err, 'err');
          this.toastr.error(err.error.message);
        }
      );
    } else {
      this.toastr.warning('PLease fill valid Info');
    }
  }
  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.charCode;

    // Only allow number keys (0-9)
    if (charCode >= 48 && charCode <= 57) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
}
