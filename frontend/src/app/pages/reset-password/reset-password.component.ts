import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#f7f9fb] font-['Sans Serif'] selection:bg-[#02464a]/10">
      <div class="flex w-full max-w-5xl h-[640px] bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(2,70,74,0.1)] border border-slate-100 mx-4">
        
        <!-- Lado Esquerdo: Branding -->
        <div class="hidden lg:flex flex-col w-1/2 bg-[#02464a] p-12 text-white relative overflow-hidden">
          <div class="relative z-10 flex items-center gap-3 mb-auto">
            <div class="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <span class="text-lg font-bold tracking-tight">Sistema de Manutenção Preventiva - PIM</span>
          </div>
          <div class="relative z-10 text-center mb-auto mt-20">
            <h1 class="text-4xl font-extrabold leading-tight mb-6">Redefinição de Senha</h1>
            <p class="text-emerald-50 text-lg leading-relaxed opacity-90">Crie uma nova senha forte para proteger sua conta.</p>
          </div>
        </div>

        <!-- Lado Direito: Formulário -->
        <div class="w-full lg:w-1/2 p-12 flex flex-col justify-center relative bg-white">
          <div class="max-w-md mx-auto w-full">
            <div class="mb-10">
              <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Nova Senha</h2>
              <p class="text-slate-500 font-medium">Digite sua nova senha abaixo.</p>
            </div>

            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div>
                <label for="password" class="block text-xs font-bold text-slate-700 tracking-widest mb-2">Nova Senha</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#02464a] text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input id="password" formControlName="novaSenha" [type]="showPassword ? 'text' : 'password'" required
                    class="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-[#02464a] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                    placeholder="••••••••">
                  <button type="button" (click)="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label for="confirm-password" class="block text-xs font-bold text-slate-700 tracking-widest mb-2">Confirmar Senha</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#02464a] text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input id="confirm-password" formControlName="confirmarSenha" [type]="showPassword ? 'text' : 'password'" required
                    class="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-[#02464a] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                    placeholder="••••••••">
                </div>
              </div>

              <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100">
                {{ error }}
              </div>

              <div *ngIf="successMessage" class="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold border border-green-100">
                {{ successMessage }}
              </div>

              <button type="submit" [disabled]="resetForm.invalid || loading"
                class="w-full group flex items-center justify-center gap-2 py-4 px-6 bg-[#02464a] hover:bg-[#013538] text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(2,70,74,0.2)] transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]">
                <span *ngIf="!loading">Redefinir Senha</span>
                <span *ngIf="loading">Processando...</span>
                <svg *ngIf="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup;
  token: string | null = null;
  loading = false;
  error = '';
  successMessage = '';
  showPassword = false;

  constructor() {
    this.resetForm = this.fb.group({
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error = 'Token de redefinição ausente ou inválido.';
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('novaSenha')?.value === g.get('confirmarSenha')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.error = '';
      this.authService.resetarSenha({ token: this.token, novaSenha: this.resetForm.value.novaSenha }).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Senha redefinida com sucesso! Você será redirecionado para o login.';
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Erro ao redefinir senha';
        }
      });
    }
  }
}
