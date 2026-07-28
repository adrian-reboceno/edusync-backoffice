import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { InactivityService } from '../../core/services/inactivity.service';
import { ToastService } from '../../core/services/toast.service';

export interface LoginRequest {
  email: string;
  password: string;
  totp_code?: string;
}

export interface AuthResponse {
  data: {
    access_token: string;
    refresh_token?: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    active_role?: {
      id: string;
      name: string;
      display_name: string;
      hierarchy_level: number;
    };
  };
  meta?: {
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private configService: ConfigService = inject(ConfigService);
  private inactivityService: InactivityService = inject(InactivityService);
  private toastService: ToastService = inject(ToastService);

  isAuthenticated = signal(false);
  isLoading = signal(false);
  user = signal<any>(null);
  accessToken = signal<string | null>(null);

  isLoggedIn = computed(() => !!this.accessToken());

  constructor() {
    this.checkAuth();
  }

  private checkAuth(): void {
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const data = JSON.parse(authData);
        this.user.set(data.user);
        this.isAuthenticated.set(true);
        this.accessToken.set(data.access_token);
      } catch (e) {
        console.error('Error parsing auth data:', e);
        this.logout();
      }
    }
  }

  login(email: string, password: string, totpCode?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.isLoading.set(true);

      const payload: LoginRequest = {
        email,
        password
      };

      if (totpCode) {
        payload.totp_code = totpCode;
      }

      const loginUrl = this.configService.loginUrl;

      this.http.post<AuthResponse>(loginUrl, payload).subscribe({
        next: (response: AuthResponse) => {
          console.log('✅ Login exitoso');
          
         const authData = {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token || null,
          user: {
            ...response.data.user,
            role: response.data.active_role?.display_name || response.data.user?.role || 'Sin rol'
          }
        };

          localStorage.setItem('auth_data', JSON.stringify(authData));
          localStorage.setItem('access_token', response.data.access_token);

          this.user.set(authData.user);
          this.accessToken.set(response.data.access_token);
          this.isAuthenticated.set(true);

          // ✅✅✅ AQUI VA EL TOAST - NO EL MODAL ✅✅✅
          // Usar .success() - NUNCA successModal()
          this.toastService.success(
            '¡Bienvenido!',
            `¡Hola ${authData.user?.name || 'Super'}! Login exitoso.`
          );

          // Iniciar inactividad
          this.inactivityService.initialize();
          
          // Redirigir después de 1 segundo
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
            this.isLoading.set(false);
            resolve(true);
          }, 1000);
        },
        error: (err: any) => {
          console.error('❌ Error en login:', err);
          this.isLoading.set(false);

          const errorMessage = err.error?.message || 'Error al iniciar sesión';
          
          // Toast de error (también usa .error(), no .errorAlert())
          this.toastService.error('Error en Login', errorMessage);
          
          resolve(false);
        }
      });
    });
  }

  async logout(): Promise<void> {
    console.log('🚪 Logout');
    
    localStorage.removeItem('auth_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    this.user.set(null);
    this.accessToken.set(null);
    this.isAuthenticated.set(false);

    this.inactivityService.destroy();

    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  refreshToken(): Promise<boolean> {
    return new Promise((resolve) => {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        resolve(false);
        return;
      }

      const refreshUrl = this.configService.refreshUrl;

      this.http.post<AuthResponse>(refreshUrl, { refresh_token: refreshToken }).subscribe({
        next: (response: AuthResponse) => {
          localStorage.setItem('access_token', response.data.access_token);
          this.accessToken.set(response.data.access_token);
          resolve(true);
        },
        error: (err: any) => {
          console.error('Error refreshing token:', err);
          this.logout();
          resolve(false);
        }
      });
    });
  }

  isUserAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getUser(): any {
    return this.user();
  }

  getAuthState() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.user(),
      accessToken: this.accessToken()
    };
  }
}
