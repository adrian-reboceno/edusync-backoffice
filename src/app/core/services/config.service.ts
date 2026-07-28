import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Servicio centralizado de configuración.
 * Proporciona URLs y configuración sin hardcoding.
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  // URLs base
  private baseApiUrl = environment.apiUrl || 'http://localhost:8000/api/v1';
  
  // Timeouts
  inactivityTimeout = (environment as any).inactivityTimeout || 30; // minutos

  /**
   * URL base del API
   */
  get apiUrl(): string {
    return this.baseApiUrl;
  }

  /**
   * URL para login
   */
  get loginUrl(): string {
    return `${this.baseApiUrl}/auth/login`;
  }

  /**
   * URL para refresh token
   */
  get refreshUrl(): string {
    return `${this.baseApiUrl}/auth/refresh`;
  }

  /**
   * URL para logout
   */
  get logoutUrl(): string {
    return `${this.baseApiUrl}/auth/logout`;
  }

  /**
   * URL para perfil del usuario
   */
  get profileUrl(): string {
    return `${this.baseApiUrl}/auth/profile`;
  }

  /**
   * URL para analytics de usuarios (resumen)
   * ✅ NOMBRE CORRECTO: analyticsUsersSummaryUrl
   */
  get analyticsUsersSummaryUrl(): string {
    return `${this.baseApiUrl}/analytics/users/summary`;
  }

  /**
   * URL para lista de usuarios
   */
  get analyticsUsersUrl(): string {
    return `${this.baseApiUrl}/analytics/users`;
  }

  /**
   * URL para detalles de usuario específico
   */
  getUserDetailUrl(neoId: string | number): string {
    return `${this.baseApiUrl}/analytics/users/${neoId}`;
  }

  /**
   * URL para datos diarios de actividad de usuario
   */
  getUserDailyActivityUrl(neoId: string | number): string {
    return `${this.baseApiUrl}/analytics/users/${neoId}/daily-activity`;
  }

  /**
   * URL para sesiones de usuario
   */
  getUserSessionsUrl(neoId: string | number): string {
    return `${this.baseApiUrl}/analytics/users/${neoId}/sessions`;
  }
}