import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  userRegister(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/register`, data)
  }
  userLogin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}auth/login`, data)
  }
  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getAllUsers`)
  }

  // Get current user information
  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('userToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}auth/user-type`, { headers })
  }
}
