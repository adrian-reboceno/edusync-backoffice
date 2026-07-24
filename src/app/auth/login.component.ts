import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { AlertService } from '../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Limpiar datos del formulario al abrir login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      totp_code: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.alertService.error('Validación', 'Por favor completa todos los campos correctamente');
      return;
    }

    this.loading = true;
    this.error = null;

    const credentials = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      totp_code: this.loginForm.get('totp_code')?.value
    };

    console.log('📤 Enviando:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        this.loading = false;
        
        if (response.data.access_token) {
          this.alertService.success(
            'Bienvenido',
            `¡Hola ${response.data.user.first_name}! Login exitoso.`
          );

          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error:', err);
        
        const errorMessage = err.error?.message || 'No se pudo iniciar sesión. Verifica tus credenciales.';
        
        this.alertService.error(
          'Error de autenticación',
          errorMessage
        );
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
