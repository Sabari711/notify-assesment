import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProjectListComponent } from './pages/project-list/project-list.component';
import { userAuthGuard } from './guard/user-auth.guard';
// import { UserListComponent } from './pages/user-list/user-list.component';
// import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: './', pathMatch: 'full' },
  { path: './', component: HomeComponent },
  {
    path: 'projects',
    component: ProjectListComponent,
    canActivate: [userAuthGuard]
  },
  // {
  //   path: 'dashboard',
  //   component: DashboardComponent,
  //   canActivate: [userAuthGuard],
  // },
];
