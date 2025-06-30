import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, interval, debounceTime, distinctUntilChanged } from 'rxjs';

import { ProjectApiService, Project, ProjectResponse, ProjectFilters } from '../../_services/project-api.service';
import { NotificationService, Notification } from '../../_services/notification.service';
import { UserApiService } from '../../_services/user-api.service';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { DeleteConfirmationDialogComponent, DeleteConfirmationData } from './delete-confirmation-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table data
  dataSource = new MatTableDataSource<Project>([]);
  displayedColumns: string[] = ['name', 'description', 'status', 'createdAt', 'actions'];

  // Pagination
  totalItems = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;

  // Filters
  filterForm: FormGroup;
  statusOptions = [
    { value: '', viewValue: 'All Status' },
    { value: 'pending', viewValue: 'Pending' },
    { value: 'active', viewValue: 'Active' },
    { value: 'completed', viewValue: 'Completed' }
  ];

  // User data
  notifications: Notification[] = [];
  userRole: string = '';
  userEmail: string = '';
  loading = false;
  error = '';
  unreadCount = 0;

  // Notification states
  notificationLoading = false;
  notificationError = '';

  private subscription = new Subscription();

  constructor(
    private projectService: ProjectApiService,
    public notificationService: NotificationService,
    private userService: UserApiService,
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.setupFilters();
    this.loadProjects();
    this.setupNotifications();
    this.setupLiveUpdates();
    this.getNotificationBasedUser()
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadUserData(): void {
    this.subscription.add(
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          console.log(user, "---------user")
          this.userRole = user.role || 'viewer';
          this.userEmail = user.email || '';

          // Update displayed columns based on user role
          if (this.userRole !== 'admin') {
            this.displayedColumns = this.displayedColumns.filter(col => col !== 'actions');
          }

          // Reload notifications after user data is loaded with a small delay
          setTimeout(() => {
            this.reloadNotifications();
          }, 500);
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.userRole = 'viewer';
          this.userEmail = '';
        }
      })
    );
  }

  private setupFilters(): void {
    // Search filter with debounce
    this.subscription.add(
      this.filterForm.get('search')?.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(() => {
        this.currentPage = 0;
        this.loadProjects();
      })
    );

    // Status filter
    this.subscription.add(
      this.filterForm.get('status')?.valueChanges.subscribe(() => {
        this.currentPage = 0;
        this.loadProjects();
      })
    );
  }

  public loadProjects(): void {
    this.loading = true;
    this.error = '';

    const filters: ProjectFilters = {
      search: this.filterForm.get('search')?.value || undefined,
      status: this.filterForm.get('status')?.value || undefined,
      page: this.currentPage + 1, // API uses 1-based pagination
      limit: this.pageSize,
      sortBy: this.sort?.active || 'createdAt',
      sortOrder: this.sort?.direction || 'desc'
    };

    this.subscription.add(
      this.projectService.getAllProjects(filters).subscribe({
        next: (response: ProjectResponse) => {
          console.log(response, "response")
          this.dataSource.data = response.data;
          this.totalItems = response.total;
          this.currentPage = response.page - 1; // Convert to 0-based for Material
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load projects';
          this.loading = false;
          console.error('Error loading projects:', error);
        }
      })
    );
  }

  async getNotificationBasedUser() {
    this.notificationService.getUnreadNotifications().subscribe({
      next(data) {
        console.log(data, "getNotificationBasedUser")
      },
      error(err) {
        console.log(err, "getNotificationBasedUser err")
      },
    })
  }

  private setupNotifications(): void {
    this.subscription.add(
      this.notificationService.getNotifications().subscribe(notifications => {
        this.notifications = notifications;
        console.log('📋 Current notifications:', notifications);
      })
    );

    this.subscription.add(
      this.notificationService.getUnreadCount().subscribe(count => {
        this.unreadCount = count;
        console.log('🔢 Unread count:', count);
      })
    );

    // Log connection status
    console.log('🔌 WebSocket connection status:', this.notificationService.getConnectionStatus());
  }

  private setupLiveUpdates(): void {
    // Refresh projects every 30 seconds for live updates
    this.subscription.add(
      interval(30000).subscribe(() => {
        this.loadProjects();
      })
    );
  }

  // Pagination event handler
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadProjects();
  }

  // Sort event handler
  onSortChange(sort: Sort): void {
    this.loadProjects();
  }

  // Clear filters
  clearFilters(): void {
    this.filterForm.patchValue({
      search: '',
      status: ''
    });
    this.currentPage = 0;
    this.loadProjects();
  }

  openProjectForm(project?: Project): void {
    const dialogRef = this.dialog.open(ProjectFormComponent, {
      width: '800px',
      data: { project, isEdit: !!project }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProjects();
        const action = project ? 'updated' : 'created';
        // this.notificationService.addProjectNotification(result.name, `was ${action}`, 'success');
      }
    });
  }

  deleteProject(project: Project): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: { projectName: project.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.subscription.add(
          this.projectService.deleteProject(project.id!).subscribe({
            next: () => {
              this.loadProjects();
              this.notificationService.addNotification(`Project "${project.name}" was deleted`, 'warning');
            },
            error: (error) => {
              console.error('Error deleting project:', error);
              this.notificationService.addNotification('Failed to delete project', 'error');
            }
          })
        );
      }
    });
  }

  markNotificationAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAllNotifications(): void {
    this.notificationService.clearAll();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'primary';
      case 'completed': return 'accent';
      case 'pending': return 'warn';
      default: return 'primary';
    }
  }

  logout(): void {
    localStorage.removeItem('userToken');
    this.router.navigate(['/']);
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  testNotification(): void {
    this.notificationService.addNotification('This is a test notification', 'info');
  }

  // New notification methods
  reloadNotifications(): void {
    this.notificationLoading = true;
    this.notificationError = '';

    this.notificationService.reloadNotifications();

    // Simulate loading state (remove this in production)
    setTimeout(() => {
      this.notificationLoading = false;
    }, 1000);
  }

  deleteNotification(notification: Notification): void {
    // Remove from local array immediately for better UX
    this.notifications = this.notifications.filter(n => n.id !== notification.id);

    // Call API to delete from database
    this.notificationService.deleteNotification(notification.id);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'project_created': return 'add_circle';
      case 'project_updated': return 'edit';
      case 'project_deleted': return 'delete';
      default: return 'notifications';
    }
  }

  getRelativeTime(timestamp: Date | string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
