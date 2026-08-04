import {
  Component, inject, signal, OnInit, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';

export interface UsuarioDTO {
  neo_id: string;
  sis_id: string;
  userid: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  organization_id: string;
  organization_name: string;
  language: string;
  time_zone: string;
  joined_at: string;
  first_login_at: string | null;
  last_login_at: string | null;
  activated: boolean;
  days_since_last_login: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, MatTabsModule],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.scss',
})
export class ListaComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Signals
  usuarios = signal<UsuarioDTO[]>([]);
  total = signal(0);
  loading = signal(false);
  filterActive = signal<boolean | undefined>(undefined);
  filterStatus = signal<'all' | 'logged_in' | 'never_logged'>('all');
  pageNumber = signal(1);

  // Estado de paginación y búsqueda
  private currentPage = 1;
  private currentSize = 10;
  private currentSearch = '';
  private currentSortKey = '';
  private currentSortDir: 'asc' | 'desc' = 'asc';

  // Getters calculados
  get paginationInfo(): string {
    const from = (this.currentPage - 1) * this.currentSize + 1;
    const to = Math.min(this.currentPage * this.currentSize, this.total());
    return `Mostrando ${from} a ${to} de ${this.total()} usuarios`;
  }

  get hasNextPage(): boolean {
    return this.currentPage < Math.ceil(this.total() / this.currentSize);
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 1;
  }

  get totalPages(): number {
    return Math.ceil(this.total() / this.currentSize);
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Inicializar si es necesario
  }

  // ✅ Handler para cambio de select (sin type casting en template)
  onRecordsPerPageChangeHandler(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.onRecordsPerPageChange(target.value);
    }
  }

  // ✅ Handler para búsqueda (sin type casting en template)
  onSearchHandler(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value !== undefined) {
      this.onSearch(target.value);
    }
  }

  loadData(): void {
    this.loading.set(true);
    
    let params = new HttpParams();
    if (this.currentSearch) {
      params = params.set('search', this.currentSearch);
    }
    if (this.filterActive() !== undefined) {
      params = params.set('activated', String(this.filterActive()));
    }
    if (this.currentSize) {
      params = params.set('per_page', this.currentSize);
    }
    if (this.currentPage) {
      params = params.set('page', this.currentPage);
    }

    const url = `${this.configService.apiUrl}/analytics/users`;

    this.http.get<PaginatedResponse<UsuarioDTO>>(url, { params }).subscribe({
      next: (response) => {
        this.usuarios.set(response.data);
        this.total.set(response.meta.total);
        this.pageNumber.set(this.currentPage);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.toastService.error(
          'Error',
          'No se pudieron cargar los usuarios'
        );
        this.loading.set(false);
      }
    });
  }

  onSearch(searchTerm: string): void {
    this.currentSearch = searchTerm;
    this.currentPage = 1;
    this.loadData();
  }

  onRecordsPerPageChange(size: string): void {
    this.currentSize = parseInt(size, 10);
    this.currentPage = 1;
    this.loadData();
  }

  setActive(value: boolean | undefined): void {
    this.filterActive.set(value);
    this.currentPage = 1;
    this.loadData();
  }

  setStatus(value: 'all' | 'logged_in' | 'never_logged'): void {
    this.filterStatus.set(value);
    this.currentPage = 1;
    this.loadData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageNumber.set(page);
      this.loadData();
    }
  }

  firstPage(): void {
    this.goToPage(1);
  }

  lastPage(): void {
    this.goToPage(this.totalPages);
  }

  previousPage(): void {
    if (this.hasPrevPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  onUserClick(usuario: UsuarioDTO): void {
    // Navegar a detalle del usuario
    this.router.navigate([`/analytics/usuarios/${usuario.neo_id}/detail`]);
  }

  getInitials(usuario: UsuarioDTO): string {
    return `${usuario.first_name.charAt(0)}${usuario.last_name.charAt(0)}`.toUpperCase();
  }

  getRoleDisplay(roles: string[]): string {
    if (!roles || roles.length === 0) return '—';
    return roles[0];
  }

  getStatusBadgeClass(usuario: UsuarioDTO): string {
    if (!usuario.activated) return 'inactive';
    if (!usuario.last_login_at) return 'never-logged';
    return 'active';
  }

  getStatusText(usuario: UsuarioDTO): string {
    if (!usuario.activated) return 'Inactivo';
    if (!usuario.last_login_at) return 'Nunca ha iniciado';
    return 'Activo';
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const pages = [];
    const totalPages = this.totalPages;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfWindow = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, this.currentPage - halfWindow);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}