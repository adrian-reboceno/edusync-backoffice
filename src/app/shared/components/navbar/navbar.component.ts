import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  user: any = null;
  showUserMenu = false;
  notificationCount = 3;
  notifications = [
    { id: 1, message: 'Nueva sincronización completada', type: 'success' },
    { id: 2, message: 'Error en sincronización de usuarios', type: 'error' },
    { id: 3, message: 'Sistema en mantenimiento a las 22:00', type: 'warning' }
  ];
  showNotifications = false;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  logout(): void {
    this.authService.logout();
    this.alertService.info('Sesión cerrada', 'Has cerrado sesión correctamente.');
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 1500);
  }

  viewNotification(notification: any): void {
    this.alertService.show(notification.type as any, 'Notificación', notification.message);
    this.showNotifications = false;
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.notificationCount = 0;
    this.alertService.info('Notificaciones', 'Todas las notificaciones han sido eliminadas.');
  }
}
