import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../../../core/services/config.service';

interface UsuarioDetail {
  user: {
    neo_id: number;
    sis_id: string | null;
    userid: string;
    first_name: string;
    last_name: string;
    email: string | null;
    roles: string[];
    organization_id: number;
    organization_name: string;
    language: string;
    time_zone: string;
    joined_at: string;
    first_login_at: string;
    last_login_at: string;
    activated: boolean;
    days_since_last_login: number;
  };
  sessions_summary: {
    total_sessions: number;
    total_hours: number;
    avg_duration_minutes: number;
    first_session_at: string;
    last_session_at: string;
  };
  daily_activity: Array<{
    date: string;
    sessions: number;
    total_minutes: number;
    avg_minutes: number;
  }>;
  sessions: Array<{
    id: number;
    login_at: string;
    logout_at: string;
    duration_minutes: number;
    ip_address: string;
  }>;
  classes: Array<{
    neo_class_id: number;
    class_name: string;
    organization_name: string;
    start_at: string;
    finish_at: string;
    enrolled_at: string;
    enroll_type: string;
    started: boolean;
    started_at: string | null;
    completed: boolean;
    completed_at: string | null;
    unenrolled: boolean;
    last_visited_at: string | null;
    time_spent_seconds: number;
    time_spent_hours: number;
    percent: number | null;
    grade: string | null;
  }>;
  daily_streak: Array<any>;
}

@Component({
  selector: 'app-usuario-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTabsModule, MatIconModule],
  templateUrl: './usuario-detail.component.html',
  styleUrl: './usuario-detail.component.scss'
})
export class UsuarioDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  // Usar signals en lugar de propiedades normales
  usuarioDetail = signal<UsuarioDetail | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  neoId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('neoId');
    this.neoId.set(id);
    if (id) {
      this.loadUsuarioDetail();
    }
  }

  private loadUsuarioDetail(): void {
    const id = this.neoId();
    if (!id) return;

    const url = `${this.configService.apiUrl}/analytics/users/${id}`;
    
    console.log('🔄 Cargando desde URL:', url);

    this.http.get<{ data: UsuarioDetail }>(url).subscribe({
      next: (response) => {
        console.log('✅ Datos recibidos:', response.data);
        this.usuarioDetail.set(response.data);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        console.error('❌ Error loading usuario detail:', err);
        this.error.set('Error al cargar los detalles del usuario');
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/analytics/usuarios/lista']);
  }

  get nombreCompleto(): string {
    const detail = this.usuarioDetail();
    if (!detail) return '';
    return `${detail.user.first_name} ${detail.user.last_name}`;
  }

  get iniciales(): string {
    const detail = this.usuarioDetail();
    if (!detail) return '';
    return `${detail.user.first_name.charAt(0)}${detail.user.last_name.charAt(0)}`.toUpperCase();
  }

  formatDate(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(date: string | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}