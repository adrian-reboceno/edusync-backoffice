import { Component, Inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '../../../../../core/services/config.service';

export interface UsuarioDetalleData {
  neoId: number;
}

type TabId = 'overview' | 'actividad' | 'sesiones' | 'progreso';

interface ChartBar {
  path: string;
  x: number;
  width: number;
  label: string;
  valueLabel: string;
  showLabel: boolean;
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  valueLabel: string;
  showLabel: boolean;
}

interface BarChart {
  viewW: number;
  viewH: number;
  padT: number;
  innerH: number;
  baselineY: number;
  gridLines: number[];
  bars: ChartBar[];
}

interface LineChart {
  viewW: number;
  viewH: number;
  padT: number;
  innerH: number;
  baselineY: number;
  gridLines: number[];
  points: ChartPoint[];
  linePath: string;
  areaPath: string;
}

interface ChartTooltip {
  x: number;
  y: number;
  viewW: number;
  viewH: number;
  label: string;
  value: string;
}

const VIEW_W = 640;
const VIEW_H = 200;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 14;
const PAD_B = 26;
const INNER_W = VIEW_W - PAD_L - PAD_R;
const INNER_H = VIEW_H - PAD_T - PAD_B;
const BASELINE_Y = PAD_T + INNER_H;
const GRID_LINES = [0.25, 0.5, 0.75].map((f) => PAD_T + INNER_H * (1 - f));

/** Genera el path de una barra con esquinas superiores redondeadas (4px) y base cuadrada. */
function roundedTopBarPath(x: number, width: number, height: number): string {
  if (height <= 0) return '';
  const r = Math.min(4, width / 2, height);
  const y = BASELINE_Y - height;
  return `M ${x} ${BASELINE_Y} L ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} ` +
    `L ${x + width - r} ${y} A ${r} ${r} 0 0 1 ${x + width} ${y + r} ` +
    `L ${x + width} ${BASELINE_Y} Z`;
}

/** Construye la geometría (barras, grid, baseline) de una gráfica de barras a partir de valores. */
function buildBarChart(data: { label: string; value: number }[], suffix: string): BarChart {
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = n > 0 ? INNER_W / n : INNER_W;
  const barWidth = Math.min(24, Math.max(4, slot - 6));
  const labelEvery = Math.max(1, Math.ceil(n / 8));

  const bars: ChartBar[] = data.map((d, i) => {
    const height = max > 0 ? (d.value / max) * INNER_H : 0;
    const x = PAD_L + i * slot + (slot - barWidth) / 2;
    return {
      path: roundedTopBarPath(x, barWidth, height),
      x: x + barWidth / 2,
      width: barWidth,
      label: d.label,
      valueLabel: `${d.value}${suffix}`,
      showLabel: i % labelEvery === 0,
    };
  });

  return { viewW: VIEW_W, viewH: VIEW_H, padT: PAD_T, innerH: INNER_H, baselineY: BASELINE_Y, gridLines: GRID_LINES, bars };
}

/** Construye la geometría (puntos, línea, área) de una gráfica de línea acumulada. */
function buildLineChart(data: { label: string; value: number }[], suffix: string): LineChart {
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = n > 1 ? INNER_W / (n - 1) : 0;
  const labelEvery = Math.max(1, Math.ceil(n / 8));

  const points: ChartPoint[] = data.map((d, i) => {
    const x = n > 1 ? PAD_L + i * step : PAD_L + INNER_W / 2;
    const y = max > 0 ? BASELINE_Y - (d.value / max) * INNER_H : BASELINE_Y;
    return { x, y, label: d.label, valueLabel: `${d.value}${suffix}`, showLabel: i % labelEvery === 0 };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${BASELINE_Y} L ${points[0].x} ${BASELINE_Y} Z`
    : '';

  return { viewW: VIEW_W, viewH: VIEW_H, padT: PAD_T, innerH: INNER_H, baselineY: BASELINE_Y, gridLines: GRID_LINES, points, linePath, areaPath };
}

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './usuario-detalle.component.html',
  styleUrl: './usuario-detalle.component.scss'
})
export class UsuarioDetalleComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);

  user = signal<any>(null);
  sessionsSummary = signal<any>(null);
  dailyActivity = signal<any[]>([]);
  sessions = signal<any[]>([]);

  readonly tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'person' },
    { id: 'actividad', label: 'Actividad Diaria', icon: 'calendar_today' },
    { id: 'sesiones', label: 'Sesiones', icon: 'devices' },
    { id: 'progreso', label: 'Progreso', icon: 'trending_up' },
  ];
  activeTab = signal<TabId>('overview');

  hoveredTooltip = signal<ChartTooltip | null>(null);

  /** 4 métricas principales del tab Overview. */
  statCards = computed(() => {
    const summary = this.sessionsSummary();
    return [
      { icon: 'event_repeat', label: 'Total sesiones', value: summary?.total_sessions ?? '—' },
      { icon: 'schedule', label: 'Horas totales', value: summary?.total_hours ?? 'N/A' },
      { icon: 'timer', label: 'Duración promedio', value: summary?.avg_duration ?? 'N/A' },
      { icon: 'calendar_month', label: 'Días activos', value: this.dailyActivity().length || '—' },
    ];
  });

  /** Gráfica de barras: minutos totales de actividad por día. */
  dailyChart = computed<BarChart>(() =>
    buildBarChart(
      this.dailyActivity().map((d) => ({ label: this.formatAxisDate(d.date), value: d.total_minutes ?? 0 })),
      'm'
    )
  );

  /** Gráfica de barras: duración (minutos) de cada sesión cerrada. */
  sessionsChart = computed<BarChart>(() =>
    buildBarChart(
      this.sessions()
        .filter((s) => s.logout_at)
        .map((s) => ({
          label: `#${s.id}`,
          value: Math.max(0, Math.round((new Date(s.logout_at).getTime() - new Date(s.login_at).getTime()) / 60000)),
        })),
      'm'
    )
  );

  /** Gráfica de línea: horas acumuladas de actividad a lo largo del tiempo. */
  progressChart = computed<LineChart>(() => {
    const sorted = [...this.dailyActivity()].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let running = 0;
    const data = sorted.map((d) => {
      running += d.total_minutes ?? 0;
      return { label: this.formatAxisDate(d.date), value: +(running / 60).toFixed(1) };
    });
    return buildLineChart(data, 'h');
  });

  /** Total de horas acumuladas al final del periodo (para el resumen del tab Progreso). */
  totalAccumulatedHours = computed(() => {
    const points = this.progressChart().points;
    return points.length ? points[points.length - 1].valueLabel : '0h';
  });

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    public dialogRef: MatDialogRef<UsuarioDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioDetalleData
  ) {}

  ngOnInit(): void {
    this.loadUserDetail();
  }

  /** Carga el detalle del usuario desde GET /api/v1/analytics/users/:neo_id. */
  private loadUserDetail(): void {
    this.loading.set(true);
    this.error.set(null);

    const url = this.configService.getUserDetailUrl(this.data.neoId);

    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.user.set(response.data?.user ?? null);
        this.sessionsSummary.set(response.data?.sessions_summary ?? null);
        this.dailyActivity.set(response.data?.daily_activity ?? []);
        this.sessions.set(response.data?.sessions ?? []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user detail:', err);
        this.error.set('No se pudo cargar la información del usuario.');
        this.loading.set(false);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  setTab(id: TabId): void {
    this.activeTab.set(id);
  }

  showBarTooltip(bar: ChartBar, chart: BarChart): void {
    this.hoveredTooltip.set({ x: bar.x, y: chart.padT, viewW: chart.viewW, viewH: chart.viewH, label: bar.label, value: bar.valueLabel });
  }

  showPointTooltip(point: ChartPoint, chart: LineChart): void {
    this.hoveredTooltip.set({ x: point.x, y: point.y, viewW: chart.viewW, viewH: chart.viewH, label: point.label, value: point.valueLabel });
  }

  hideTooltip(): void {
    this.hoveredTooltip.set(null);
  }

  rolesLabel(user: any): string {
    return (user?.roles ?? []).join(', ') || '—';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'Nunca';
    return new Date(value).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  formatShortDate(value: string | null | undefined): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  /** Etiqueta corta (día + mes) usada en los ejes de las gráficas. */
  private formatAxisDate(value: string | null | undefined): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }
}
