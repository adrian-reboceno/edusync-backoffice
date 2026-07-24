import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/v1';
  private authState = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.loadAuthState();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('📤 POST a:', `${this.apiUrl}/auth/login`);
    console.log('📤 Datos:', credentials);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        console.log('✅ Respuesta:', response);
        this.setAuthState(response.data);
      }),
      catchError(error => {
        console.error('❌ Error HTTP:', error);
        throw error;
      })
    );
  }

  private setAuthState(data: any): void {
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      this.authState.next(data);
    }
  }

  private loadAuthState(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.authState.next({ token, user: JSON.parse(user) });
    }
  }

  getAuthState(): Observable<any> {
    return this.authState.asObservable();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.authState.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
