import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private router = inject(Router);
  private toastService = inject(ToastService);

  private inactivityTimeout: any;
  private readonly INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutos

  initialize(): void {
    console.log('🔄 InactivityService inicializado');
    this.resetInactivityTimer();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Eventos que resetean el timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => this.resetInactivityTimer(), true);
    });
  }

  private resetInactivityTimer(): void {
    // Limpiar el timer anterior
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    // Establecer nuevo timer
    this.inactivityTimeout = setTimeout(() => {
      this.handleInactivity();
    }, this.INACTIVITY_TIME);
  }

  private async handleInactivity(): Promise<void> {
    console.log('⏰ Sesión expirada por inactividad');

    // 1️⃣ Mostrar alerta
    this.toastService.error(
      'Sesión Expirada',
      'Tu sesión ha expirado debido a inactividad. Por favor inicia sesión nuevamente.'
    );

    // 2️⃣ Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_data');
    localStorage.removeItem('user');

    // 3️⃣ Limpiar sessionStorage
    sessionStorage.clear();

    // 4️⃣ Esperar 1.5 segundos para que el usuario vea el mensaje
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 5️⃣ Redirigir al login
    await this.router.navigate(['/auth/login']);

    // 6️⃣ Limpiar el timer
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }

  destroy(): void {
    console.log('🧹 InactivityService destruido');
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }
}