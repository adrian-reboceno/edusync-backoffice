import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class UsuariosResumenComponent implements OnInit {
  stats = [
    { title: 'Usuarios Totales', value: '1,234', icon: '👥', color: '#3498db' },
    { title: 'Usuarios Activos', value: '856', icon: '✅', color: '#2ecc71' },
    { title: 'Usuarios Inactivos', value: '378', icon: '❌', color: '#e74c3c' }
  ];

  ngOnInit(): void {}
}
