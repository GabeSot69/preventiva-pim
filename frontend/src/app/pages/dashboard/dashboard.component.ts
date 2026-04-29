import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 class="text-4xl font-black text-gray-900 tracking-tight">Dashboard PIM</h1>
          <p class="text-gray-500 font-medium">Indicadores de Manutenção Preventiva em tempo real.</p>
        </div>
        <button (click)="gerarRelatorio()" 
                [style.background-color]="'#02464a'"
                class="flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[#02464a]/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          Gerar relatório
        </button>
      </div>

      <!-- Métricas Principais -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-green-50 text-green-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase">Em Dia</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ emDia()?.equipamentosEmDia || 0 }}</p>
          <p class="text-xs text-gray-400 mt-2">{{ emDia()?.percentual || 0 }}% do total</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-red-50 text-red-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase">Atrasadas</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.atrasadas || 0 }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase">Próximos 7 dias</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.previstas7Dias || 0 }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0 1 12 2.251Z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase">Conformidade</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.conformidadeGeralChecklist || 0 }}%</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-emerald-100 text-[#02464a] rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <span class="text-xs font-bold text-gray-400 uppercase">Execuções/Mês</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.execucoesNoMes || 0 }}</p>
        </div>
      </div>

      <!-- Lista de Atrasadas -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 class="font-black text-gray-800 uppercase tracking-wider text-sm">Manutenções Críticas em Atraso</h2>
          <span class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase">Ação Imediata</span>
        </div>
        
        <div class="divide-y divide-gray-50">
          <div *ngFor="let item of atrasadas()" class="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                {{ item.equipamento?.codigo?.substring(0, 2) || 'EQ' }}
              </div>
              <div>
                <h3 class="font-bold text-gray-800">{{ item.titulo }}</h3>
                <p class="text-xs text-gray-400 font-medium">{{ item.equipamento?.nome }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-8">
              <div class="text-right">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Data Prevista</p>
                <p class="text-sm font-black text-gray-700">{{ item.proxima_em | date:'dd/MM/yyyy' }}</p>
              </div>
              <div class="text-right w-24">
                <p class="text-[10px] font-bold text-red-400 uppercase mb-1">Atraso</p>
                <p class="text-sm font-black text-red-600">{{ calcularDiasAtraso(item.proxima_em) }} dias</p>
              </div>
              <button [routerLink]="['/app/execucoes/nova']" [queryParams]="{ planoId: item.id }"
                      class="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all active:scale-95">
                Resolver
              </button>
            </div>
          </div>

          <div *ngIf="atrasadas().length === 0" class="p-20 text-center text-gray-400 italic">
            Parabéns! Não existem manutenções em atraso no momento.
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private service = inject(DashboardService);
  
  metricas = signal<any>(null);
  atrasadas = signal<any[]>([]);
  emDia = signal<any>(null);

  ngOnInit(): void {
    this.service.getMetricas().subscribe(res => this.metricas.set(res));
    this.service.getAtrasadas().subscribe(res => this.atrasadas.set(res));
    this.service.getEmDia().subscribe(res => this.emDia.set(res));
  }

  calcularDiasAtraso(data: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prevista = new Date(data);
    const diff = hoje.getTime() - prevista.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  gerarRelatorio() {
    console.log('Gerando relatório...');
    alert('A funcionalidade de exportação de relatório PDF/Excel está sendo preparada e estará disponível em breve.');
  }
}
