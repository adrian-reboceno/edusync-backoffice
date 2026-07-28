import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';

interface OrgData {
  id: number;
  name: string;
  totals: {
    total: number;
    activated: number;
    never_logged_in: number;
    activation_rate: number;
  };
  by_role: {
    students: number;
    teachers: number;
    administrators: number;
    others: number;
  };
}

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
  organizations: OrgData[] = [];
  selectedOrgIndex = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService
  ) {
    console.log('[CONSTRUCTOR] UsuariosResumenComponent inicializado');
  }

  ngOnInit(): void {
    console.log('[ngOnInit] Component iniciado');
    this.loadData();
  }

  loadData(): void {
    console.log('[loadData] Iniciando carga...');
    
    const url = this.configService.analyticsUsersSummaryUrl;
    console.log('[loadData] URL:', url);

    this.http.get<any>(url).subscribe({
      next: (response: any) => {
        console.log('[SUCCESS] Datos recibidos:', response);
        this.data = response.data;
        this.organizations = response.data.organizations || [];
        this.selectedOrgIndex = 0;
        this.loading = false;
        this.cdr.markForCheck();
        console.log('[SUCCESS] Data asignada, loading=false');
      },
      error: (err: any) => {
        console.error('[ERROR] Error en petición:', err);
        this.loading = false;
        this.error = 'Error al cargar datos';
        this.cdr.markForCheck();
      }
    });
  }

  selectOrganization(index: number): void {
    console.log('[SELECT] Cambiando a organización index:', index);
    this.selectedOrgIndex = index;
    this.cdr.markForCheck();
  }

  retry(): void {
    this.loadData();
  }

  // ===== GETTERS DATOS GLOBALES =====
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

  // ===== GETTERS ORGANIZACIÓN SELECCIONADA =====
  get selectedOrg(): OrgData | null {
    return this.organizations[this.selectedOrgIndex] || null;
  }

  get orgTotalUsers(): number {
    return this.selectedOrg?.totals?.total ?? 0;
  }

  get orgActivatedUsers(): number {
    return this.selectedOrg?.totals?.activated ?? 0;
  }

  get orgActivationRate(): number {
    return this.selectedOrg?.totals?.activation_rate ?? 0;
  }

  get orgStudents(): number {
    return this.selectedOrg?.by_role?.students ?? 0;
  }

  get orgTeachers(): number {
    return this.selectedOrg?.by_role?.teachers ?? 0;
  }

  get orgAdministrators(): number {
    return this.selectedOrg?.by_role?.administrators ?? 0;
  }

  get orgOthers(): number {
    return this.selectedOrg?.by_role?.others ?? 0;
  }
}