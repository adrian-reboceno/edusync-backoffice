import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'question';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  show(type: AlertType, title: string, message: string, confirmButtonText: string = 'Entendido'): void {
    Swal.fire({
      icon: type,
      title: title,
      html: message,
      confirmButtonText: confirmButtonText,
      confirmButtonColor: '#42a5f5',
      allowOutsideClick: false,
      allowEscapeKey: false,
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-html'
      }
    });
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message);
  }

  warning(title: string, message: string): void {
    this.show('warning', title, message);
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  confirm(title: string, message: string): Promise<boolean> {
    return Swal.fire({
      icon: 'question',
      title: title,
      html: message,
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#42a5f5',
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal2-custom-popup',
        title: 'swal2-custom-title',
        htmlContainer: 'swal2-custom-html'
      }
    }).then(result => result.isConfirmed);
  }
}
