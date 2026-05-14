import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="flex items-center justify-between mb-10 print:hidden">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight">Relatórios de Manutenção</h1>
          <p class="text-gray-500 font-medium">Detalhamento das manutenções executadas por período.</p>
        </div>
        <div class="flex gap-4">
          <button (click)="imprimir()" 
                  class="px-6 py-2 bg-white text-[#02464a] border-2 border-[#02464a] rounded-xl font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2 hover:bg-emerald-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.89l-2.1 2.1m2.1-2.1l2.1 2.1m-2.1-2.1h.01M18 7.5h.008v.008H18V7.5zm-3 0h.008v.008H15V7.5zM9 15h.008v.008H9V15zm-3 0h.008v.008H6V15zm11.25-10.5H6.75a2.25 2.25 0 00-2.25 2.25v10.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125V21M3 18h18" />
            </svg>
            Imprimir Relatório
          </button>
          <div class="w-px h-10 bg-gray-200"></div>
          <button (click)="aba.set('semana')" 
                  [class]="aba() === 'semana' ? 'bg-[#02464a] text-white' : 'bg-white text-gray-500'"
                  class="px-6 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95 border border-gray-100">
            Esta Semana
          </button>
          <button (click)="aba.set('mes')" 
                  [class]="aba() === 'mes' ? 'bg-[#02464a] text-white' : 'bg-white text-gray-500'"
                  class="px-6 py-2 rounded-xl font-bold shadow-sm transition-all active:scale-95 border border-gray-100">
            Este Mês
          </button>
        </div>
      </div>

      <!-- Cabeçalho de Impressão (Só aparece no papel) -->
      <div class="hidden print:block mb-8 border-b-2 border-gray-900 pb-4">
        <div class="flex justify-between items-end">
          <div>
            <h1 class="text-2xl font-black uppercase">Relatório de Manutenção Preventiva</h1>
            <p class="text-sm font-bold text-gray-600">Período: {{ aba() === 'semana' ? 'Semanal' : 'Mensal' }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold">Emitido em: {{ dataEmissao | date:'dd/MM/yyyy HH:mm' }}</p>
            <p class="text-xs font-bold">PIM - Sistema de Gestão de Manutenção</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
        <div class="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between print:bg-white print:px-0">
          <h2 class="font-black text-gray-800 uppercase tracking-wider text-xs">
            {{ aba() === 'semana' ? 'Manutenções da Semana' : 'Manutenções do Mês' }}
          </h2>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase print:border print:border-emerald-200">
            {{ listaFiltrada().length }} registros
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-100 print:bg-gray-100 print:text-black">
                <th class="px-6 py-4">Data</th>
                <th class="px-6 py-4">Equipamento</th>
                <th class="px-6 py-4">Plano</th>
                <th class="px-6 py-4">Técnico</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-center">Conformidade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let item of listaFiltrada()" class="hover:bg-gray-50 transition-colors group print:break-inside-avoid">
                <td class="px-6 py-4">
                  <p class="text-sm font-black text-gray-700">{{ item.data_execucao | date:'dd/MM/yyyy' }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase">{{ item.data_execucao | date:'HH:mm' }}h</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-bold text-gray-800">{{ item.plano?.equipamento?.nome }}</p>
                  <p class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{{ item.plano?.equipamento?.codigo }}</p>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-gray-600">
                  {{ item.plano?.titulo }}
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-gray-700">{{ item.tecnico?.nome }}</span>
                </td>
                <td class="px-6 py-4">
                  <span [class]="getStatusClass(item.status?.chave)" 
                        class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm border border-black/5">
                    {{ item.status?.descricao }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col items-center">
                    <span [class]="item.conformidade ? 'text-green-600' : 'text-red-600'" class="text-xs font-black">
                      {{ item.conformidade ? '✓ CONFORME' : '✗ NÃO CONFORME' }}
                    </span>
                    <p class="text-[9px] font-bold text-gray-400 mt-1">{{ item.percentual_conformidade }}% de itens OK</p>
                  </div>
                </td>
              </tr>
              <tr *ngIf="listaFiltrada().length === 0">
                <td colspan="6" class="px-6 py-20 text-center text-gray-400 italic">
                  Nenhum registro encontrado para este período.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media print {
      :host {
        background: white !important;
      }
      /* Ocultar elementos da interface que não devem sair na impressão */
      .print\\:hidden, 
      aside, 
      nav,
      button {
        display: none !important;
      }
      /* Ajustar margens e largura para o papel */
      .max-w-7xl {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      /* Garantir que as cores de fundo apareçam (se o navegador permitir) */
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      table {
        width: 100%;
        border: 1px solid #e5e7eb;
      }
      th {
        background-color: #f3f4f6 !important;
        color: black !important;
      }
    }
  `]
})
export class RelatoriosComponent implements OnInit {
  private service = inject(DashboardService);
  
  relatorio = signal<any>(null);
  aba = signal<'semana' | 'mes'>('semana');
  dataEmissao = new Date();

  ngOnInit(): void {
    this.service.getRelatorio().subscribe(res => {
      this.relatorio.set(res);
    });
  }

  listaFiltrada() {
    if (!this.relatorio()) return [];
    return this.aba() === 'semana' ? this.relatorio().semana : this.relatorio().mes;
  }

  imprimir() {
    window.print();
  }

  getStatusClass(chave: string) {
    switch (chave) {
      case 'realizada': return 'bg-green-50 text-green-700 border-green-100';
      case 'parcial': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'nao_realizada': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  }
}
