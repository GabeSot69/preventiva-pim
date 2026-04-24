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
    <div class="min-h-screen flex items-center justify-center bg-[#f7f9fb] font-['Sans Serif'] selection:bg-blue-100">
      <div class="flex w-full max-w-5xl h-[640px] bg-white rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(26,54,93,0.1)] border border-slate-100 mx-4">
        
        <!-- Lado Esquerdo: Branding/Visual Industrial (Centralizado) -->
        <div class="hidden lg:flex flex-col justify-between w-1/2 bg-[#1a365d] p-12 text-white relative overflow-hidden">
          <div class="relative z-10 flex items-center gap-3">
            <div class="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <span class="text-lg font-bold tracking-tight">Sistema de Manutenção Preventiva - PIM</span>
          </div>         
          <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-300">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1-2.83-2.83l-3.94 3.6z"/>
            </svg>
          </div>

          <div class="relative z-10 text-center">
            <h1 class="text-4xl font-extrabold leading-tight mb-6">
              Gestão inteligente de manutenções.
            </h1>
            <p class="text-blue-100 text-lg leading-relaxed opacity-90">
              Centralize e padronize seus dados de manutenção com autoridade e precisão.
            </p>
          </div>

          <div class="relative z-10 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-200">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold">Ambiente Seguro</p>
                <p class="text-xs text-blue-200/80 tracking-wider">Criptografia de ponta a ponta ativa</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Lado Direito: Formulário -->
        <div class="w-full lg:w-1/2 p-12 flex flex-col justify-center relative bg-white">
          <div class="max-w-md mx-auto w-full">
            <div class="mb-10">
              <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Bem-vindo</h2>
              <p class="text-slate-500 font-medium">Acesse sua conta para gerenciar o catálogo.</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div>
                <label for="email" class="block text-xs font-bold text-slate-700 tracking-widest mb-2">E-mail Corporativo</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#1a365d] text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input id="email" formControlName="email" type="email" required
                    class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#1a365d] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                    placeholder="nome@empresa.com.br">
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-2">
                  <label for="password" class="block text-xs font-bold text-slate-700 tracking-widest">Senha</label>
                  <a href="#" class="text-xs font-bold text-[#1a365d] hover:underline decoration-2 underline-offset-4">Esqueci minha senha</a>
                </div>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-[#1a365d] text-slate-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input id="password" formControlName="senha" type="password" required
                    class="block w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-[#1a365d] focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                    placeholder="••••••••">
                  <button type="button" class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex items-center">
                <input type="checkbox" id="remember" class="w-4 h-4 rounded border-slate-300 text-[#1a365d] focus:ring-[#1a365d]/20 transition-all cursor-pointer">
                <label for="remember" class="ml-2.5 text-sm font-semibold text-slate-600 cursor-pointer select-none">Lembrar acesso</label>
              </div>

              <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-100">
                {{ error }}
              </div>

              <button type="submit" [disabled]="loginForm.invalid || loading"
                class="w-full group flex items-center justify-center gap-2 py-4 px-6 bg-[#1a365d] hover:bg-[#122642] text-white font-bold rounded-xl shadow-[0_10px_20px_rgba(26,54,93,0.2)] transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]">
                <span *ngIf="!loading">Entrar no Sistema</span>
                <span *ngIf="loading">Autenticando...</span>
                <svg *ngIf="!loading" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            </form>

            <div class="mt-12 pt-8 border-t border-slate-100 text-center">
              <p class="text-sm font-medium text-slate-500">
                Precisa de ajuda? Entre em contato com o <a href="#" class="text-[#1a365d] font-bold hover:underline">Suporte TI</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
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
