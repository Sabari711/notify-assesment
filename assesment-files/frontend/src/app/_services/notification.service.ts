import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
    projectId?: number;
    projectName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications = new BehaviorSubject<Notification[]>([]);
    private notificationId = 1;
    private apiUrl = environment.apiUrl;

    constructor(
        private toastr: ToastrService,
        private http: HttpClient
    ) {
        // Load initial notifications from API
        this.loadNotifications();

        // Simulate real-time notifications every 30 seconds
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);
    }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('userToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Load notifications from API
    private loadNotifications(): void {
        this.http.get<Notification[]>(`${this.apiUrl}notifications`, {
            headers: this.getHeaders()
        }).subscribe({
            next: (notifications) => {
                this.notifications.next(notifications);
            },
            error: (error) => {
                console.error('Error loading notifications:', error);
            }
        });
    }

    // Get notifications as observable
    getNotifications(): Observable<Notification[]> {
        return this.notifications.asObservable();
    }

    // Add new notification
    addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
        const notification: Notification = {
            id: this.notificationId++,
            message,
            type,
            timestamp: new Date(),
            read: false
        };

        const currentNotifications = this.notifications.value;
        this.notifications.next([notification, ...currentNotifications]);

        // Show toast notification
        switch (type) {
            case 'success':
                this.toastr.success(message);
                break;
            case 'info':
                this.toastr.info(message);
                break;
            case 'warning':
                this.toastr.warning(message);
                break;
            case 'error':
                this.toastr.error(message);
                break;
        }
    }

    // Mark notification as read via API
    markAsRead(id: number): void {
        this.http.patch(`${this.apiUrl}notifications/${id}/read`, {}, {
            headers: this.getHeaders()
        }).subscribe({
            next: () => {
                const currentNotifications = this.notifications.value;
                const updatedNotifications = currentNotifications.map(notification =>
                    notification.id === id ? { ...notification, read: true } : notification
                );
                this.notifications.next(updatedNotifications);
            },
            error: (error) => {
                console.error('Error marking notification as read:', error);
            }
        });
    }

    // Mark all notifications as read via API
    markAllAsRead(): void {
        this.http.patch(`${this.apiUrl}notifications/read-all`, {}, {
            headers: this.getHeaders()
        }).subscribe({
            next: () => {
                const currentNotifications = this.notifications.value;
                const updatedNotifications = currentNotifications.map(notification => ({
                    ...notification,
                    read: true
                }));
                this.notifications.next(updatedNotifications);
            },
            error: (error) => {
                console.error('Error marking all notifications as read:', error);
            }
        });
    }

    // Clear all notifications via API
    clearAll(): void {
        this.http.delete(`${this.apiUrl}notifications`, {
            headers: this.getHeaders()
        }).subscribe({
            next: () => {
                this.notifications.next([]);
            },
            error: (error) => {
                console.error('Error clearing notifications:', error);
            }
        });
    }

    // Get unread count
    getUnreadCount(): Observable<number> {
        return new Observable(observer => {
            this.notifications.subscribe(notifications => {
                const unreadCount = notifications.filter(n => !n.read).length;
                observer.next(unreadCount);
            });
        });
    }

    // Simulate checking for new notifications (in real app, this would be WebSocket or polling)
    private checkForNewNotifications(): void {
        // Check for new notifications from API
        this.http.get<Notification[]>(`${this.apiUrl}notifications/new`, {
            headers: this.getHeaders()
        }).subscribe({
            next: (newNotifications) => {
                if (newNotifications.length > 0) {
                    const currentNotifications = this.notifications.value;
                    this.notifications.next([...newNotifications, ...currentNotifications]);

                    // Show toast for new notifications
                    newNotifications.forEach(notification => {
                        if (!notification.read) {
                            this.toastr.info(notification.message, 'New Notification');
                        }
                    });
                }
            },
            error: (error) => {
                console.error('Error checking for new notifications:', error);
            }
        });
    }

    // Add project-specific notifications
    addProjectNotification(projectName: string, action: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
        this.addNotification(`Project "${projectName}" ${action}`, type);
    }
}
