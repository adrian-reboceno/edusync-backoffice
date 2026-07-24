import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: 'activo' | 'inactivo';
  fechaRegistro: string;
}

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class UsuariosListaComponent implements OnInit {
  usuarios: Usuario[] = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com', rol: 'Estudiante', estado: 'activo', fechaRegistro: '2024-01-01' },
    { id: 2, nombre: 'María García', email: 'maria@example.com', rol: 'Profesor', estado: 'activo', fechaRegistro: '2023-12-15' },
    { id: 3, nombre: 'Carlos López', email: 'carlos@example.com', rol: 'Estudiante', estado: 'inactivo', fechaRegistro: '2024-01-05' }
  ];

  filtroRol = '';
  filtroEstado = '';
  busqueda = '';
  usuariosFiltrados: Usuario[] = [];

  roles = ['Estudiante', 'Profesor', 'Administrativo', 'Director'];
  estados = ['activo', 'inactivo'];

  ngOnInit(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.usuariosFiltrados = this.usuarios.filter(u => {
      let cumpleFiltros = true;

      if (this.filtroRol && u.rol !== this.filtroRol) cumpleFiltros = false;
      if (this.filtroEstado && u.estado !== this.filtroEstado) cumpleFiltros = false;
      if (this.busqueda) {
        const termino = this.busqueda.toLowerCase();
        if (!u.nombre.toLowerCase().includes(termino) &&
            !u.email.toLowerCase().includes(termino)) {
          cumpleFiltros = false;
        }
      }

      return cumpleFiltros;
    });
  }

  onFiltroChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroRol = '';
    this.filtroEstado = '';
    this.busqueda = '';
    this.aplicarFiltros();
  }
}
