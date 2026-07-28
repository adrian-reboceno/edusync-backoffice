import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from './config.service';
import { ToastService } from './toast.service';

/**
 * Servicio que monitorea la inactividad del usuario y cierra la sesión automáticamente.
 * También cierra la sesión al cerrar el navegador o la pestaña.
 */
@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private router = inject(Router);
  private configService = inject(ConfigService);
  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);
  
  private inactivityTimer: any;
  private warningTimer: any;
  private isInitialized = false;

  /**
   * Inicializa el servicio de inactividad.
   * Debe llamarse en el AppComponent o al hacer login.
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    console.log('✅ Inactivity monitor iniciado');

    // Monitorear eventos de actividad
    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousemove', () => this.resetTimer());
      document.addEventListener('keydown', () => this.resetTimer());
      document.addEventListener('click', () => this.resetTimer());
      document.addEventListener('scroll', () => this.resetTimer());
      document.addEventListener('touchstart', () => this.resetTimer());
    });

    // Monitorear cierre de navegador/pestaña
    window.addEventListener('beforeunload', (event) => {
      this.handleLogout();
    });

    // Iniciar el timer
    this.resetTimer();
  }

  /**
   * Detiene el servicio de inactividad.
   * Debe llamarse al hacer logout.
   */
  destroy(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }
    this.isInitialized = false;
    console.log('❌ Inactivity monitor detenido');
  }

  /**
   * Reinicia el timer de inactividad.
   */
  private resetTimer(): void {
    // Limpiar timers anteriores
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
    }

    const timeoutMs = this.configService.inactivityTimeout * 60 * 1000; // Convertir minutos a milisegundos
    const warningMs = timeoutMs - (2 * 60 * 1000); // Avisar 2 minutos antes

    // Timer para mostrar advertencia (opcional)
    this.warningTimer = setTimeout(() => {
      console.warn('⚠️ Tu sesión expirará en 2 minutos por inactividad');
      // Mostrar advertencia como toast
      this.toastService.warning(
        'Sesión expirando',
        'Tu sesión expirará en 2 minutos por inactividad'
      );
    }, warningMs);

    // Timer para logout
    this.inactivityTimer = setTimeout(() => {
      console.log('⏱️ Sesión expirada por inactividad');
      this.ngZone.run(() => {
        this.logout('Sesión expirada por inactividad');
      });
    }, timeoutMs);
  }

  /**
   * Cierra sesión inmediatamente.
   * @param reason Razón del logout
   */
  async logout(reason: string = 'Cierre de sesión'): Promise<void> {
    console.log(`🚪 Logout: ${reason}`);
    
    // Limpiar localStorage
    localStorage.removeItem('auth_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Detener el monitor
    this.destroy();
    
    // Mostrar alert de sesión expirada si es por inactividad
    if (reason === 'Sesión expirada por inactividad') {
      await this.toastService.sessionExpired(
        'Tu sesión ha expirado debido a inactividad.'
      );
    }
    
    // Redirigir al login
    this.router.navigate(['/login'], {
      queryParams: { reason: reason }
    });
  }

  /**
   * Maneja el evento beforeunload (cierre de navegador/pestaña).
   */
  private handleLogout(): void {
    // Limpiar datos
    localStorage.removeItem('auth_data');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}