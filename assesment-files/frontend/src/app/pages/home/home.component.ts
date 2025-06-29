import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SignUpComponent } from '../sign-up/sign-up.component';
import { LoginComponent } from '../login/login.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(public dialog: MatDialog, private toastr: ToastrService, private router: Router) { }

  openSignUp() {
    const dialogRef = this.dialog.open(SignUpComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('The dialog was closed', result);
        this.toastr.success(result.message)
        this.openLogin()
      }
    });
  }
  openLogin() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('The dialog was closed', result);
        this.toastr.success(result.message)
        // Token is already stored in localStorage by login component
        // Redirect to project list after successful login
        this.router.navigate(['/projects'])
      }
    });
  }
}
