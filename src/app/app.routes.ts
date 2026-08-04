// Busca en tu app.routes.ts esta línea:
// import { UsuariosListaComponent } from './features/analytics/usuarios/lista/lista.component';

// Y reemplázala con:
import { ListaComponent } from './features/analytics/usuarios/lista/lista.component';

// Luego busca donde se usa en las rutas y cambia:
// { path: 'usuarios', component: UsuariosListaComponent }
// por:
// { path: 'usuarios', component: ListaComponent }

// Ejemplo completo de cómo debería verse:

import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { ListaComponent } from './features/analytics/usuarios/lista/lista.component';
// ... otros imports

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'analytics',
        children: [
          {
            path: 'usuarios',
            children: [
              {
                path: 'lista',
                component: ListaComponent  // ← CAMBIO AQUÍ
              },
              {
                path: ':neoId',
                children: [
                  {
                    path: 'detail',
                    loadComponent: () => import('./features/analytics/usuarios/detail/usuario-detail.component').then(m => m.UsuarioDetailComponent)
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  // ... resto de rutas
];