// frontend\src\app\pages\execucao-form\execucao-form.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-execucao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6 max-w-2xl mx-auto min-h-screen bg-gray-50/30">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Registrar Execução</h1>
        <p class="text-gray-500">Confirme a manutenção realizada no equipamento.</p>
      </div>

      <form [formGroup]="execForm" (ngSubmit)="salvar()" 
            class="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
        
        <div class="grid grid-cols-1 gap-6">
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Plano de Manutenção</label>
            <select formControlName="plano_id" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-gray-700 appearance-none">
              <option value="">Selecione o plano...</option>
              <option *ngFor="let p of planos()" [value]="p.id">
                {{ p.titulo }} (Equipamento: {{ p.equipamento_id }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Data da Execução</label>
              <input type="date" formControlName="data_execucao" 
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none">
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Responsável Técnico</label>
              <div class="flex items-center px-4 py-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-700 font-medium h-[50px]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ tecnicoResponsavel() || 'Buscando responsável...' }}
              </div>
            </div>
          </div>

          <div *ngIf="itensChecklist().length > 0" class="mt-4">
            <label class="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span class="p-1 bg-blue-600 rounded text-white text-[10px]">PIM</span>
              Checklist de Verificação
            </label>
            <div class="space-y-2">
              <div *ngFor="let item of itensChecklist()" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span class="text-sm text-gray-600">{{ item.descricao }}</span>
                <div class="flex gap-2">
                  <button type="button" (click)="toggleItem(item.id, true)"
                          [class]="item.conforme ? 'bg-green-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'"
                          class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">C</button>
                  <button type="button" (click)="toggleItem(item.id, false)"
                          [class]="item.conforme === false ? 'bg-red-600 text-white shadow-md' : 'bg-gray-200 text-gray-400'"
                          class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">NC</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status da Manutenção</label>
            <select formControlName="status" 
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none">
              <option value="realizada">✅ Realizada</option>
              <option value="parcial">⚠️ Parcial</option>
              <option value="nao_realizada">❌ Não Realizada</option>
            </select>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <input type="checkbox" formControlName="foi_conforme" id="conforme" 
                   class="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 transition-all">
            <label for="conforme" class="text-sm font-medium text-gray-700 cursor-pointer">
              Execução em conformidade com o plano?
            </label>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Observações / Detalhes Técnicos</label>
            <textarea formControlName="observacoes" rows="3" 
                      placeholder="Descreva o que foi feito..." 
                      class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none resize-none"></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-gray-50">
            <button type="button" routerLink="/app/planos" 
                    class="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            <button type="submit" [disabled]="execForm.invalid" 
                    class="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 hover:shadow-lg disabled:bg-gray-300 transition-all active:scale-95">
              Confirmar Execução
            </button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class ExecucaoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  execForm: FormGroup;
  planos = signal<any[]>([]);
  tecnicoResponsavel = signal<string>('');
  itensChecklist = signal<any[]>([]);

  constructor() {
    this.execForm = this.fb.group({
      plano_id: ['', Validators.required],
      data_execucao: [new Date().toISOString().substring(0, 10), Validators.required],
      status: ['realizada', Validators.required],
      foi_conforme: [true],
      observacoes: ['']
    });
  }

  ngOnInit(): void {
    this.carregarPlanosAtivos();

    this.execForm.get('plano_id')?.valueChanges.subscribe(id => {
      const plano = this.planos().find(p => p.id == id);
      if (plano) {
        this.tecnicoResponsavel.set(plano.tecnico_responsavel);
        this.buscarChecklistDoPlano(id);
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['planoId']) {
        this.execForm.patchValue({ plano_id: Number(params['planoId']) });
      }
    });
  }

  carregarPlanosAtivos(): void {
    this.http.get<any[]>('http://localhost:3000/planos').subscribe({
      next: (res) => {
        this.planos.set(res);
        const idAtual = this.execForm.get('plano_id')?.value;
        if (idAtual) {
          const plano = res.find(p => p.id == idAtual);
          if (plano) {
            this.tecnicoResponsavel.set(plano.tecnico_responsavel);
            this.buscarChecklistDoPlano(idAtual);
          }
        }
      }
    });
  }

  buscarChecklistDoPlano(planoId: number): void {
    this.http.get<any[]>(`http://localhost:3000/planos/${planoId}/itens`).subscribe({
      next: (res) => this.itensChecklist.set(res.map(i => ({ ...i, conforme: true }))),
      error: () => this.itensChecklist.set([])
    });
  }

  toggleItem(itemId: number, status: boolean): void {
    this.itensChecklist.update(itens => 
      itens.map(i => i.id === itemId ? { ...i, conforme: status } : i)
    );
  }

  salvar(): void {
    if (this.execForm.valid) {
      // AJUSTE: Garantindo o mapeamento explícito dos itens do Checklist
      const itensMapeados = this.itensChecklist().map(item => ({
        id: item.id,
        conforme: item.conforme
      }));

      const dadosParaSalvar = {
        ...this.execForm.value,
        checklists: itensMapeados
      };

      // LOG: Verifique no Console do Navegador (F12) se 'checklists' está preenchido
      console.log("Dados enviados ao Backend:", dadosParaSalvar);

      this.http.post('http://localhost:3000/execucoes', dadosParaSalvar).subscribe({
        next: () => {
          alert('Execução e Checklist registrados com sucesso!');
          this.router.navigate(['/app/planos']);
        },
        error: (err) => {
          console.error("Erro no POST:", err);
          alert('Erro ao registrar execução.');
        }
      });
    }
  }
}