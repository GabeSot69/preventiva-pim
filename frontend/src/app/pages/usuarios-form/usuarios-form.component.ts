import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-[#02464a]/10 text-[#02464a] rounded-2xl shadow-sm border border-[#02464a]/5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v9m-8-3h2.662m-6.463-8.24c.703 0 1.282.124 1.735.373a2.73 2.73 0 0 1 1.257 1.327c.298.638.448 1.36.448 2.164 0 .806-.15 1.531-.448 2.177a2.74 2.74 0 0 1-1.257 1.332c-.453.248-1.032.373-1.735.373H5V5.5h3.699ZM15 12.25c0 .507-.114.935-.341 1.284a1.8 1.8 0 0 1-.932.723c-.394.13-.884.195-1.468.195H11v-4.5h1.259c.584 0 1.074.065 1.468.195.394.13.705.37.932.72a1.79 1.79 0 0 1 .341 1.283Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
            {{ idEdicao ? 'Editar' : 'Novo' }} usuário
          </h1>
          <p class="text-gray-500 text-sm">Cadastre ou atualize as informações do colaborador.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        <div class="grid grid-cols-1 gap-6">
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nome completo</label>
            <input type="text" formControlName="nome" placeholder="Ex: João Silva" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700">
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">E-mail corporativo</label>
            <input type="email" formControlName="email" placeholder="Ex: joao.silva@empresa.com" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700">
          </div>

          <div *ngIf="!idEdicao">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
            <input type="password" formControlName="senha" placeholder="••••••••" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Perfil de acesso</label>
              <select formControlName="perfilId" 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700 appearance-none">
                <option value="" disabled>Selecione um perfil</option>
                <option *ngFor="let p of perfis()" [value]="p.id">{{ p.descricao }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Setor</label>
              <input type="text" formControlName="setor" placeholder="Ex: Manutenção, TI" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#02464a]/20 focus:border-[#02464a] transition-all outline-none text-gray-700">
            </div>
          </div>

          <div *ngIf="form.invalid && form.touched" class="p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
            <p class="text-xs font-bold uppercase mb-2">Campos pendentes:</p>
            <ul class="text-xs list-disc list-inside space-y-1">
              <li *ngIf="form.get('nome')?.invalid">Nome é obrigatório</li>
              <li *ngIf="form.get('email')?.invalid">E-mail inválido</li>
              <li *ngIf="!idEdicao && form.get('senha')?.invalid">Senha é obrigatória (mín. 6 caracteres)</li>
              <li *ngIf="form.get('perfilId')?.invalid">Perfil é obrigatório</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/usuarios" 
                    class="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            
            <button type="submit" [disabled]="form.invalid" 
                    [style.background-color]="form.invalid ? '#cbd5e1' : '#02464a'"
                    class="px-8 py-2.5 text-white font-bold rounded-xl hover:brightness-110 hover:-translate-y-0.5 active:scale-95 transition-all disabled:cursor-not-allowed shadow-lg shadow-[#02464a]/20">
              {{ idEdicao ? 'Salvar Alterações' : 'Cadastrar Usuário' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class UsuariosFormComponent implements OnInit {
  private service = inject(UsuarioService);
  private perfilService = inject(PerfilService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form: FormGroup;
  idEdicao: number | null = null;
  perfis = signal<any[]>([]);

  constructor() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.minLength(6)]],
      perfilId: ['', Validators.required],
      setor: ['']
    });
  }

  ngOnInit(): void {
    this.perfilService.listar().subscribe({
      next: (res) => {
        console.log('Perfis carregados:', res);
        if (res && res.length > 0) {
          this.perfis.set(res);
        } else {
          // Fallback caso a API retorne vazio mas os perfis existam no sistema
          console.warn('API retornou lista vazia de perfis. Usando fallback.');
          this.perfis.set([
            { id: 1, descricao: 'TI' },
            { id: 2, descricao: 'Gestor' },
            { id: 3, descricao: 'Supervisor' },
            { id: 4, descricao: 'Técnico' }
          ]);
        }
      },
      error: (err) => {
        console.error('Erro ao carregar perfis:', err);
        // Fallback para não travar a tela
        this.perfis.set([
          { id: 1, descricao: 'TI' },
          { id: 2, descricao: 'Gestor' },
          { id: 3, descricao: 'Supervisor' },
          { id: 4, descricao: 'Técnico' }
        ]);
      }
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.idEdicao = Number(id);
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity();

      this.service.obterPorId(this.idEdicao).subscribe(res => {
        this.form.patchValue({
          ...res,
          perfilId: res.perfil?.id
        });
      });
    } else {
      this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  salvar() {
    if (this.form.valid) {
      const dados = { ...this.form.value };
      if (this.idEdicao && !dados.senha) {
        delete dados.senha;
      }

      // Converte perfilId para number pois o select retorna string
      dados.perfilId = Number(dados.perfilId);

      const obs = this.idEdicao
        ? this.service.atualizar(this.idEdicao, dados)
        : this.service.criar(dados);

      obs.subscribe({
        next: () => {
          alert(`Usuário ${this.idEdicao ? 'atualizado' : 'cadastrado'} com sucesso!`);
          this.router.navigate(['/app/usuarios']);
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          const msg = err.error?.message || 'Falha ao salvar usuário.';
          alert(msg);
        }
      });
    }
  }
}
