import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlanoService } from '../../services/plano.service';

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
            <select formControlName="equipamento_id" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 appearance-none">
              <option value="">Selecione o equipamento...</option>
              <option *ngFor="let eq of equipamentos()" [value]="eq.tag">
                {{ eq.nome }} ({{ eq.tag }})
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
              <select formControlName="periodicidade_dias" 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700 appearance-none">
                <option [value]="30">Mensal (30 dias)</option>
                <option [value]="90">Trimestral (90 dias)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Data da 1ª Execução</label>
              <input type="date" formControlName="data_inicial" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700">
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Técnico Responsável Padrão</label>
            <input type="text" formControlName="tecnico_responsavel" placeholder="Nome do responsável técnico"
                   class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700">
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
  private router = inject(Router);
  private fb = inject(FormBuilder);

  planoForm: FormGroup;  
 
  equipamentos = signal([
    { id: '1', nome: 'Gerador Caterpillar', tag: 'GER-01' },
    { id: '2', nome: 'Compressor de Ar', tag: 'COMP-04' }
  ]);

  constructor() {
    this.planoForm = this.fb.group({
      equipamento_id: ['', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(5)]],   
      periodicidade_dias: [30, Validators.required],
      data_inicial: ['', Validators.required],
      tecnico_responsavel: ['', Validators.required],
      descricao: [''] 
    });
  }

  ngOnInit(): void {}

  salvar() {
    if (this.planoForm.valid) {
      this.planoService.criar(this.planoForm.value).subscribe({
        next: () => {
          alert('Plano de manutenção cadastrado com sucesso!');
          this.router.navigate(['/app/planos']);
        },
        error: (err) => {
          console.error('Erro ao salvar:', err);
          alert('Falha ao conectar com o servidor do PIM.');
        }
      });
    }
  }
}