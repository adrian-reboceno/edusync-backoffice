import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/**
 * Servicio de TOAST usando SweetAlert2 con Swal.mixin()
 * Forma CORRECTA de crear toasts en SweetAlert2
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Crear la configuración de toast reutilizable
  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  /**
   * Toast de éxito (auto-dismiss en 3 segundos)
   */
  success(title: string, message?: string): void {
    console.log('📢 Mostrando TOAST éxito:', title);
    this.Toast.fire({
      icon: 'success',
      title: title,
      text: message || ''
    });
  }

  /**
   * Toast de error (auto-dismiss en 4 segundos)
   */
  error(title: string, message?: string): void {
    console.log('📢 Mostrando TOAST error:', title);
    this.Toast.fire({
      icon: 'error',
      title: title,
      text: message || '',
      timer: 4000
    });
  }

  /**
   * Toast de advertencia (auto-dismiss en 3.5 segundos)
   */
  warning(title: string, message?: string): void {
    console.log('📢 Mostrando TOAST warning:', title);
    this.Toast.fire({
      icon: 'warning',
      title: title,
      text: message || '',
      timer: 3500
    });
  }

  /**
   * Toast de información (auto-dismiss en 3 segundos)
   */
  info(title: string, message?: string): void {
    console.log('📢 Mostrando TOAST info:', title);
    this.Toast.fire({
      icon: 'info',
      title: title,
      text: message || ''
    });
  }

  /**
   * Alert (modal con botón). Solo para casos especiales.
   * NUNCA para login - usa success() en su lugar.
   */
  sessionExpired(reason: string): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: 'Sesión Expirada',
      html: `<p>${reason}</p><p class="small">Por favor, inicia sesión nuevamente.</p>`,
      confirmButtonText: 'Ir al Login',
      confirmButtonColor: '#405189',
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }

  /**
   * Cierra cualquier notificación abierta
   */
  close(): void {
    Swal.close();
  }
}