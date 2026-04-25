import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlanoService } from '../../services/plano.service';

@Component({
  selector: 'app-planos-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50/30">
      <div *ngIf="plano()" class="space-y-6">

        <div class="flex items-center justify-between mb-8">
          <div>
            <a routerLink="/app/planos" class="text-blue-600 text-sm font-bold flex items-center gap-1 mb-2 hover:underline">
              ← Voltar para lista
            </a>
            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">{{ plano().titulo }}</h1>
            <p class="text-gray-500">{{ plano().descricao || 'Sem descrição detalhada.' }}</p>
          </div>
          <div class="flex gap-3">
             <button [routerLink]="['/app/execucoes/nova']" [queryParams]="{ planoId: plano().id }"
                     class="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all">
                Nova Manutenção
             </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label class="text-xs font-bold text-gray-400 uppercase">Equipamento</label>
            <p class="text-lg font-bold text-gray-800">{{ plano().equipamento?.nome }}</p>
            <p class="text-sm text-gray-500">ID: {{ plano().equipamento?.id }}</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label class="text-xs font-bold text-gray-400 uppercase">Periodicidade</label>
            <p class="text-lg font-bold text-gray-800">{{ plano().periodicidade_dias }} dias</p>
          </div>
          <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label class="text-xs font-bold text-gray-400 uppercase">Próxima Manutenção</label>
            <p class="text-lg font-bold text-blue-600">{{ plano().proxima_em | date:'dd/MM/yyyy' }}</p>
          </div>
        </div>

        <!-- Checklist do Plano -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 class="font-bold text-gray-800">Itens do Checklist</h2>
          </div>
          <div class="p-6">
            <ul class="space-y-3">
              <li *ngFor="let item of plano().itens_checklist" class="flex items-center gap-3 text-sm text-gray-600">
                <div class="w-5 h-5 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-[10px]">
                  {{ item.ordem }}
                </div>
                {{ item.descricao }}
              </li>
              <li *ngIf="!plano().itens_checklist?.length" class="text-gray-400 italic text-sm">
                Nenhum item configurado para este checklist.
              </li>
            </ul>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-50 bg-gray-50/50">
            <h2 class="font-bold text-gray-800">Histórico de Execuções</h2>
          </div>
          <div class="divide-y divide-gray-50">
            <div *ngFor="let exec of plano().execucoes" class="p-6 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-bold text-gray-700">{{ exec.data_execucao | date:'dd/MM/yyyy HH:mm' }}</span>
                <span [ngClass]="{
                  'bg-green-100 text-green-700': exec.status?.chave === 'realizada',
                  'bg-orange-100 text-orange-700': exec.status?.chave === 'parcial',
                  'bg-red-100 text-red-700': exec.status?.chave === 'nao_realizada'
                }" class="px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  {{ exec.status?.nome || exec.status?.chave }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">Técnico: <b>{{ exec.tecnico?.nome }}</b></p>
              <p *ngIf="exec.observacoes" class="text-sm text-gray-500 italic">"{{ exec.observacoes }}"</p>
            </div>
            <div *ngIf="!plano().execucoes?.length" class="p-10 text-center text-gray-400 italic">
              Nenhuma manutenção registrada para este plano ainda.
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PlanosDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private planoService = inject(PlanoService);

  plano = signal<any>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.planoService.obterPorId(id).subscribe({
        next: (res) => this.plano.set(res),
        error: (err) => console.error('Erro ao buscar detalhes:', err)
      });
    }
  }
}