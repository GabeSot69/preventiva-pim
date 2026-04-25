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
      
      <div class="mb-10">
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Dashboard PIM</h1>
        <p class="text-gray-500 font-medium">Indicadores de Manutenção Preventiva em tempo real.</p>
      </div>

      <!-- Métricas Principais -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-red-50 text-red-600 rounded-2xl">⚠️</div>
            <span class="text-xs font-bold text-gray-400 uppercase">Atrasadas</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.atrasadas || 0 }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-orange-50 text-orange-600 rounded-2xl">⏳</div>
            <span class="text-xs font-bold text-gray-400 uppercase">Próximos 7 dias</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.previstas7Dias || 0 }}</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">✅</div>
            <span class="text-xs font-bold text-gray-400 uppercase">Conformidade</span>
          </div>
          <p class="text-3xl font-black text-gray-900">{{ metricas()?.conformidadeGeralChecklist || 0 }}%</p>
        </div>

        <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 bg-emerald-100 text-[#02464a] rounded-2xl">📊</div>
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

  ngOnInit(): void {
    this.service.getMetricas().subscribe(res => this.metricas.set(res));
    this.service.getAtrasadas().subscribe(res => this.atrasadas.set(res));
  }

  calcularDiasAtraso(data: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prevista = new Date(data);
    const diff = hoje.getTime() - prevista.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
