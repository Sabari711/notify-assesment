import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface Notification {
    id?: string;
    message: string;
    type: string;
    timestamp: Date;
    read?: boolean;
    data?: any;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface NotificationResponse {
    data: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Helper to check for valid MongoDB ObjectId
function isValidObjectId(id: string | undefined): boolean {
    return !!id && /^[a-f\d]{24}$/i.test(id);
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications = new BehaviorSubject<Notification[]>([]);
    private socket: Socket;
    private isConnected = false;
    private apiUrl = environment.apiUrl;
    private loadAttempts = 0;
    private maxLoadAttempts = 3;

    constructor(
        private toastr: ToastrService,
        private http: HttpClient
    ) {
        console.log('🔌 Initializing WebSocket connection to:', environment.apiUrl);

        // Load existing notifications immediately
        this.loadNotifications();

        // Connect to backend WebSocket
        this.socket = io(environment.apiUrl, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            timeout: 20000
        });

        // Connection event listeners
        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected successfully');
            this.isConnected = true;
            this.toastr.success('Connected to real-time notifications', 'WebSocket Connected');
            // Reload notifications when connected to get any new ones
            this.loadNotifications();
        });

        this.socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            this.isConnected = false;
            this.toastr.warning('Disconnected from real-time notifications', 'WebSocket Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
            this.isConnected = false;
            this.toastr.error('Failed to connect to real-time notifications', 'Connection Error');
        });

        // Listen for the initial connection message from backend
        this.socket.on('connected', (data) => {
            console.log('🎉 Received connection confirmation:', data);
        });

        // Listen for notifications from backend
        this.socket.on('notification', (notification: Notification) => {
            console.log('🔔 Received WebSocket notification:', notification);
            this.handleIncomingNotification(notification);
        });

        // Debug: Listen for all events
        this.socket.onAny((eventName, ...args) => {
            console.log(`📡 WebSocket event: ${eventName}`, args);
        });

        // Retry loading notifications if initial load fails
        timer(2000).subscribe(() => {
            if (this.notifications.value.length === 0 && this.loadAttempts < this.maxLoadAttempts) {
                console.log('🔄 Retrying notification load...');
                this.loadNotifications();
            }
        });
    }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('userToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Load notifications from database
    private loadNotifications(): void {
        // Only load if user is authenticated
        const token = localStorage.getItem('userToken');
        if (!token) {
            console.log('🔒 No authentication token found, skipping notification load');
            return;
        }

        this.loadAttempts++;
        console.log(`📋 Loading notifications (attempt ${this.loadAttempts}/${this.maxLoadAttempts})...`);

        this.http.get<NotificationResponse>(`${this.apiUrl}notifications`, {
            headers: this.getHeaders()
        }).subscribe({
            next: (response) => {
                console.log('📋 Loaded notifications from database:', response.data);
                this.notifications.next(response.data);
                this.loadAttempts = 0; // Reset attempts on success
            },
            error: (error) => {
                console.error('❌ Error loading notifications:', error);
                console.error('Error details:', error.status, error.message);

                // Retry with exponential backoff
                if (this.loadAttempts < this.maxLoadAttempts) {
                    const delay = Math.pow(2, this.loadAttempts) * 1000; // 2s, 4s, 8s
                    console.log(`🔄 Retrying in ${delay}ms...`);
                    timer(delay).subscribe(() => this.loadNotifications());
                } else {
                    console.error('❌ Max retry attempts reached for loading notifications');
                }
            }
        });
    }

    // Public method to manually reload notifications
    public reloadNotifications(): void {
        this.loadAttempts = 0; // Reset attempts for manual reload
        this.loadNotifications();
    }

    private handleIncomingNotification(notification: Notification) {
        console.log('📨 Processing notification:', notification);

        // Add to notification list
        const currentNotifications = this.notifications.value;
        const newNotification = {
            ...notification,
            read: false,
            id: notification.id || Math.random().toString(36).substring(2)
        };

        this.notifications.next([newNotification, ...currentNotifications]);

        // Show toast
        switch (notification.type) {
            case 'project_created':
                this.toastr.success(notification.message, 'Project Created');
                break;
            case 'project_updated':
                this.toastr.info(notification.message, 'Project Updated');
                break;
            case 'project_deleted':
                this.toastr.warning(notification.message, 'Project Deleted');
                break;
            default:
                this.toastr.info(notification.message, 'Notification');
        }
    }

    // Get connection status
    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // Manually connect if needed
    connect(): void {
        if (!this.isConnected) {
            this.socket.connect();
        }
    }

    // Manually disconnect
    disconnect(): void {
        this.socket.disconnect();
    }

    getNotifications(): Observable<Notification[]> {
        return this.notifications.asObservable();
    }

    getUnreadCount(): Observable<number> {
        return new Observable(observer => {
            this.notifications.subscribe(notifications => {
                const unreadCount = notifications.filter(n => !n.read).length;
                observer.next(unreadCount);
            });
        });
    }

    // Mark notification as read via API
    markAsRead(id: string | undefined): void {
        if (!isValidObjectId(id)) return;
        this.http.patch(`${this.apiUrl}notifications/${id}/read`, {}, {
            headers: this.getHeaders()
        }).subscribe({
            next: () => {
                const updated = this.notifications.value.map(n =>
                    n.id === id ? { ...n, read: true } : n
                );
                this.notifications.next(updated);
            },
            error: (error) => {
                console.error('❌ Error marking notification as read:', error);
            }
        });
    }

    // Mark all notifications as read via API
    markAllAsRead(): void {
        this.http.patch(`${this.apiUrl}notifications/read-all`, {}, {
            headers: this.getHeaders()
        }).subscribe({
            next: () => {
                const updated = this.notifications.value.map(n => ({ ...n, read: true }));
                this.notifications.next(updated);
            },
            error: (error) => {
                console.error('❌ Error marking all notifications as read:', error);
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
                console.error('❌ Error clearing notifications:', error);
            }
        });
    }

    // Delete a specific notification via API
    deleteNotification(id: string | undefined): void {
        if (!isValidObjectId(id)) return;
        this.http.delete(`${this.apiUrl}notifications/${id}`, {
            headers: this.getHeaders()
        }).subscribe({
            next: () => {
                const updated = this.notifications.value.filter(n => n.id !== id);
                this.notifications.next(updated);
            },
            error: (error) => {
                console.error('❌ Error deleting notification:', error);
            }
        });
    }

    // For local/project-specific notifications (optional)
    addNotification(message: string, type: string = 'info'): void {
        const notification: Notification = {
            id: Math.random().toString(36).substring(2),
            message,
            type,
            timestamp: new Date(),
            read: false
        };
        const currentNotifications = this.notifications.value;
        this.notifications.next([notification, ...currentNotifications]);
        this.toastr.info(message, 'Notification');
    }

    // Fetch only unread notifications for the current user
    getUnreadNotifications(): Observable<Notification[]> {
        return this.http.get<NotificationResponse>(`${this.apiUrl}notifications/unread-for-user`, {
            headers: this.getHeaders()
        }).pipe(
            // Map the response to just the notifications array
            map(response => response.data)
        );
    }
}
