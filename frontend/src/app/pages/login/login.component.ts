import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div>
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg font-bold text-3xl">P</div>
          </div>
          <h2 class="text-center text-3xl font-extrabold text-gray-900 tracking-tight">Preventiva PIM</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Acesse o portal de gestão de manutenção
          </p>
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-bold text-gray-700 mb-1">E-mail Corporativo</label>
              <input id="email" formControlName="email" type="email" required
                class="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="seu@email.com">
            </div>
            <div>
              <label for="password" class="block text-sm font-bold text-gray-700 mb-1">Senha</label>
              <input id="password" formControlName="senha" type="password" required
                class="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm"
                placeholder="••••••••">
            </div>
          </div>

          <div *ngIf="error" class="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
            {{ error }}
          </div>

          <div>
            <button type="submit" [disabled]="loginForm.invalid || loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-100">
              <span *ngIf="!loading">Entrar no Sistema</span>
              <span *ngIf="loading">Autenticando...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => this.router.navigate(['/app/dashboard']),
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Falha na autenticação';
        }
      });
    }
  }
}
