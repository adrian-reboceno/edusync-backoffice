import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DataTableComponent, DataTableColumn, DataTablePageEvent } from '../../../../shared/components/data-table/data-table.component';

import { ConfigService } from '../../../../core/services/config.service';
import { Router } from '@angular/router';

/** Columnas que el backend acepta en `order_by` (GetUsersListRequest). */
const ORDERABLE = ['last_login_at', 'first_login_at', 'joined_at', 'first_name', 'last_name'];
const DEFAULT_ORDER_BY = 'last_login_at';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, DataTableComponent, MatIconModule],
  templateUrl: './lista.component.html',
  styleUrl: './lista.component.scss'
})
export class UsuariosListaComponent implements OnInit {
  /* ── State ──────────────────────────────────── */
  rows = signal<any[]>([]);
  total = signal(0);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedRows = signal<any[]>([]);

  /* ── Tabla ──────────────────────────────────── */
  columns: DataTableColumn[] = [
    { key: 'neo_id', label: 'ID', sortable: false },
    { key: 'first_name', label: 'Nombre', sortable: true },
    { key: 'last_name', label: 'Apellido', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'roles_label', label: 'Roles', sortable: false },
    { key: 'organization_name', label: 'Organización', sortable: false },
    { key: 'last_login_at', label: 'Último acceso', sortable: true },
    { key: 'total_sessions', label: 'Sesiones', sortable: false },
    { key: 'activated_label', label: 'Estado', sortable: false },
  ];

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /** Maneja cambios en paginación, búsqueda y ordenamiento. */
  onPageChange(event: DataTablePageEvent): void {
    this.loadUsers(event);
  }

  /** Maneja cambios en selección de filas. */
  onSelectionChange(selected: any[]): void {
    this.selectedRows.set(selected);
  }

  /**
   * Carga usuarios desde GET /api/v1/analytics/users.
   *
   * El endpoint usa snake_case (`per_page`, `order_by`, `order_dir`) y devuelve
   * el total dentro de `meta`, por eso se traduce el evento del data-table.
   */
  private loadUsers(event?: DataTablePageEvent): void {
    this.loading.set(true);
    this.error.set(null);

    // El data-table arranca con sortKey vacío; el backend valida contra una
    // lista blanca, así que cualquier valor no permitido se descarta.
    const orderBy = event?.sortKey && ORDERABLE.includes(event.sortKey)
      ? event.sortKey
      : DEFAULT_ORDER_BY;

    let params = new HttpParams()
      .set('page', String(event?.page ?? 1))
      .set('per_page', String(event?.pageSize ?? 10))
      .set('order_by', orderBy)
      .set('order_dir', event?.sortDir ?? 'desc');

    const search = event?.search?.trim();
    if (search) {
      params = params.set('search', search);
    }

    const url = this.configService.analyticsUsersUrl;

    this.http.get<any>(url, { params }).subscribe({
      next: (response) => {
        this.rows.set((response.data ?? []).map((u: any) => this.toRow(u)));
        this.total.set(response.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.rows.set([]);
        this.total.set(0);
        this.error.set('No se pudieron cargar los usuarios.');
        this.loading.set(false);
      }
    });
  }

  /** Aplana el usuario del API a valores listos para mostrar en la tabla. */
  private toRow(u: any): any {
    return {
      ...u,
      roles_label: (u.roles ?? []).join(', ') || '—',
      last_login_at: this.formatDate(u.last_login_at),
      joined_at: this.formatDate(u.joined_at),
      activated_label: u.activated ? 'Activado' : 'Sin acceso',
    };
  }

  private formatDate(value: string | null): string {
    if (!value) return 'Nunca';
    return new Date(value).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  /** Abre el modal con el detalle completo del usuario. */
  view(row: any): void {
    console.log('Click en view, row:', row);
    this.router.navigate(['/analytics/usuarios', row.neo_id, 'detail']);
  }

  /** Editar usuario. */
  edit(row: any): void {
    console.log('Edit user:', row);
    // TODO: Abrir modal de edición
  }

  /** Eliminar usuario. */
  delete(row: any): void {
    console.log('Delete user:', row);
    // TODO: Confirmar y eliminar
  }

  /** Exportar filas seleccionadas. */
  exportSelected(): void {
    const selected = this.selectedRows();
    if (selected.length === 0) {
      alert('Selecciona al menos una fila');
      return;
    }
    console.log('Export:', selected);
    // TODO: Exportar a CSV/Excel
  }
}
