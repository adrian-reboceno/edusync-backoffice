import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = [
    { label: 'SINCRONIZACIONES', value: '1,245', icon: '📊' },
    { label: 'USUARIOS', value: '328', icon: '👥' },
    { label: 'TASA DE ÉXITO', value: '98.5%', icon: '✅' },
    { label: 'ALERTAS', value: '12', icon: '⚠️' }
  ];

  modules = [
    { name: 'Sincronización', icon: '🔄', desc: 'Gestión de sincronización bidireccional' },
    { name: 'Gestión de Usuarios', icon: '👥', desc: 'Administración de usuarios y permisos' },
    { name: 'Reportes', icon: '📊', desc: 'Análisis y reportes de sincronización' },
    { name: 'Auditoría', icon: '📋', desc: 'Registro de actividades del sistema' },
    { name: 'Configuración', icon: '⚙️', desc: 'Configuración de integraciones' },
    { name: 'API & Webhooks', icon: '🔌', desc: 'Gestión de APIs y webhooks' }
  ];

  ngOnInit(): void {}
}
