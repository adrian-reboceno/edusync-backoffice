import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-usuarios-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class UsuariosResumenComponent implements OnInit {
  loading = true;
  error: string | null = null;
  data: any = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    console.log('[CONSTRUCTOR] UsuariosResumenComponent inicializado');
  }

  ngOnInit(): void {
    console.log('[ngOnInit] Component iniciado');
    this.loadData();
  }

  loadData(): void {
    console.log('[loadData] Iniciando carga...');
    
    const url = 'http://localhost:8000/api/v1/analytics/users/summary';
    console.log('[loadData] URL:', url);

    this.http.get<any>(url).subscribe({
      next: (response: any) => {
        console.log('[SUCCESS] Datos recibidos:', response);
        this.data = response.data;
        this.loading = false;
        this.cdr.markForCheck();  // ← CLAVE: Fuerza detección de cambios
        console.log('[SUCCESS] Data asignada, loading=false, change detection triggered');
      },
      error: (err: any) => {
        console.error('[ERROR] Error en petición:', err);
        this.loading = false;
        this.error = 'Error al cargar datos';
        this.cdr.markForCheck();  // ← También aquí
      }
    });
  }

  retry(): void {
    this.loadData();
  }

  get totalUsers(): number {
    return this.data?.totals?.total ?? 0;
  }

  get activatedUsers(): number {
    return this.data?.totals?.activated ?? 0;
  }

  get activationRate(): number {
    return this.data?.totals?.activation_rate ?? 0;
  }

  get totalSessions(): number {
    return this.data?.sessions?.total_sessions ?? 0;
  }

  get activeUsers(): number {
    return this.data?.sessions?.users_with_sessions ?? 0;
  }

  get avgSessions(): number {
    return this.data?.sessions?.avg_sessions_per_user ?? 0;
  }

  get students(): number {
    return this.data?.by_role?.students ?? 0;
  }

  get teachers(): number {
    return this.data?.by_role?.teachers ?? 0;
  }

  get administrators(): number {
    return this.data?.by_role?.administrators ?? 0;
  }

  get others(): number {
    return this.data?.by_role?.others ?? 0;
  }
}