import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  ngOnInit(): void {
    localStorage.clear();

    if (this.authService.isUserAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      totp_code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      rememberMe: [false]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.toastService.warning(
        'Campos inválidos',
        'Por favor, completa todos los campos correctamente'
      );
      return;
    }

    this.loading = true;

    try {
      const { email, password, totp_code } = this.loginForm.value;

      const success = await this.authService.login(
        email,
        password,
        totp_code || undefined
      );

      if (success) {
        console.log('✅ Login exitoso, redirigiendo...');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      this.toastService.error(
        'Error',
        error?.message || 'Ocurrió un error durante el login'
      );
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.loginForm.valid) {
      this.onSubmit();
    }
  }
}