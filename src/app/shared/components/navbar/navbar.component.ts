import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface MenuItem {
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  activeMenuIndex: number | null = null;
  showUserMenu = false;

  userName = 'Super Admin';
  userEmail = 'admin@edusync.com';
  userRole = 'Administrador';
  userInitials = 'SA';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const auth = JSON.parse(authData);
        this.userName = auth.name || 'Usuario';
        this.userEmail = auth.email || 'user@edusync.com';
        this.userRole = auth.role || 'Usuario';
        this.userInitials = this.getInitials(this.userName);
      } catch (e) {
        console.error('Error parsing auth data:', e);
      }
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  }

  toggleMenu(index: number): void {
    console.log('Toggle menu index:', index, 'current:', this.activeMenuIndex);
    this.activeMenuIndex = this.activeMenuIndex === index ? null : index;
    this.showUserMenu = false;
  }

  closeMenus(): void {
    this.activeMenuIndex = null;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.activeMenuIndex = null;
  }

  isMenuOpen(index: number): boolean {
    const isOpen = this.activeMenuIndex === index;
    console.log('isMenuOpen check - index:', index, 'activeMenuIndex:', this.activeMenuIndex, 'result:', isOpen);
    return isOpen;
  }

  logout(): void {
    localStorage.removeItem('auth_data');
    this.router.navigate(['/login']);
  }
}