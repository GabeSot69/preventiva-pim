import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlanoService } from '../../services/plano.service';
import { EquipamentoService } from '../../services/equipamento.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-planos-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Novo plano de manutenção</h1>
          <p class="text-gray-500">Vincule uma rotina preventiva a um equipamento do PIM.</p>
        </div>
      </div>

      <form [formGroup]="planoForm" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">

        <div class="grid grid-cols-1 gap-6">

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Equipamento</label>
            <select formControlName="equipamentoId" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 appearance-none">
              <option value="">Selecione o equipamento...</option>
              <option *ngFor="let eq of equipamentos()" [value]="eq.id">
                {{ eq.nome }} ({{ eq.codigo }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Título do Plano</label>
            <input type="text" formControlName="titulo" placeholder="Ex: Manutenção Preventiva de Motores" 
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Periodicidade</label>
              <select formControlName="periodicidadeDias" 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 appearance-none">
                <option [value]="30">Mensal (30 dias)</option>
                <option [value]="90">Trimestral (90 dias)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Data da 1ª Execução</label>
              <input type="date" formControlName="dataProximaManutencao" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Técnico Responsável</label>
            <select formControlName="tecnicoId" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 appearance-none">
              <option value="">Selecione o técnico...</option>
              <option *ngFor="let user of usuarios()" [value]="user.id">
                {{ user.nome }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
            <textarea formControlName="descricao" placeholder="Detalhes do plano..."
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 h-32"></textarea>
          </div>

          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/planos" 
                    class="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="planoForm.invalid" 
                    class="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-blue-100">
              Salvar Plano
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class PlanosFormComponent implements OnInit {
  private planoService = inject(PlanoService);
  private equipamentoService = inject(EquipamentoService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  planoForm: FormGroup;  
  equipamentos = signal<any[]>([]);
  usuarios = signal<any[]>([]);

  constructor() {
    this.planoForm = this.fb.group({
      equipamentoId: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(5)]],   
      periodicidadeDias: [30, Validators.required],
      dataProximaManutencao: ['', Validators.required],
      tecnicoId: [''],
      descricao: [''] 
    });
  }

  ngOnInit(): void {
    this.carregarEquipamentos();
    this.carregarUsuarios();
  }

  carregarEquipamentos() {
    this.equipamentoService.listar().subscribe(res => this.equipamentos.set(res));
  }

  carregarUsuarios() {
    this.usuarioService.listar().subscribe(res => this.usuarios.set(res));
  }

  salvar() {
    if (this.planoForm.valid) {
      const dados = {
        ...this.planoForm.value,
        equipamentoId: Number(this.planoForm.value.equipamentoId),
        periodicidadeDias: Number(this.planoForm.value.periodicidadeDias),
        tecnicoId: this.planoForm.value.tecnicoId ? Number(this.planoForm.value.tecnicoId) : undefined,
        dataProximaManutencao: new Date(this.planoForm.value.dataProximaManutencao).toISOString()
      };

      this.planoService.criar(dados).subscribe({
        next: () => {
          alert('Plano de manutenção cadastrado com sucesso!');
          this.router.navigate(['/app/planos']);
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          alert('Falha ao salvar plano.');
        }
      });
    }
  }
}