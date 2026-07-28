import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAnalyticsOpen = false;
  showUserMenu = false;

  ngOnInit(): void {
    console.log('NavbarComponent initialized');
  }

  // Obtener información DIRECTA del AuthService (sin duplicar estado)
  get userName(): string {
    const user = this.authService.getUser() || {};
    return (user as any)?.name || (user as any)?.email || 'Usuario';
  }

  get userEmail(): string {
    const user = this.authService.getUser() || {};
    return (user as any)?.email || 'sin-email@example.com';
  }

  get userInitials(): string {
    const name = this.userName;
    return name.charAt(0).toUpperCase();
  }

  get userRole(): string {
    const user = this.authService.getUser() || {};
    return (user as any)?.role || 'Sin rol';
  }

  toggleAnalyticsMenu(): void {
    this.isAnalyticsOpen = !this.isAnalyticsOpen;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  async logout(): Promise<void> {
    console.log('🚪 Iniciando logout...');
    
    try {
      // Limpiar localStorage
      localStorage.removeItem('auth_data');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Llamar al servicio de logout
      await this.authService.logout();
      
      console.log('✅ Logout exitoso');
      
      // Redirigir al login
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 500);
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      
      // Limpiar manualmente de todas formas
      localStorage.removeItem('auth_data');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      this.router.navigate(['/auth/login']);
    }
  }

  closeMenus(): void {
    this.isAnalyticsOpen = false;
    this.showUserMenu = false;
  }
}