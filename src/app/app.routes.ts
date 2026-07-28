import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { MainLayoutComponent } from './shared/layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { UsuariosResumenComponent } from './features/analytics/usuarios/resumen/resumen.component';
import { UsuariosListaComponent } from './features/analytics/usuarios/lista/lista.component';

export const routes: Routes = [
  {
    path: 'auth/login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'analytics/usuarios/resumen',
        component: UsuariosResumenComponent
      },
      {
        path: 'analytics/usuarios/lista',
        component: UsuariosListaComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];