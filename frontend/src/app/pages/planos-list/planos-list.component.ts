import { Component, inject, signal, OnInit, computed } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlanoService } from '../../services/plano.service';

@Component({
  selector: 'app-planos-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Planos de Manutenção</h1>
          <p class="text-gray-500">Gerencie as rotinas preventivas do PIM em tempo real.</p>
        </div>
        
        <button routerLink="/app/planos/novo" 
                [style.background-color]="'#02464a'"
                class="flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[#02464a]/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo plano
        </button>
      </div>

      <div class="flex flex-wrap gap-3 mb-8">
        <button (click)="filtroAtual.set('todos')" 
                [class]="filtroAtual() === 'todos' ? 'bg-[#02464a] text-white shadow-md shadow-[#02464a]/20' : 'bg-white text-gray-600 border-gray-200'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all">
          Todos ({{ planos().length }})
        </button>
        <button (click)="filtroAtual.set('atrasados')" 
                [class]="filtroAtual() === 'atrasados' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-red-100'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          Só Atrasados
        </button>
        <button (click)="filtroAtual.set('criticos')" 
                [class]="filtroAtual() === 'criticos' ? 'bg-orange-500 text-white' : 'bg-white text-orange-600 border-orange-100'"
                class="px-5 py-2 rounded-xl text-sm font-bold border transition-all shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Críticos (7 dias)
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let plano of planosFiltrados()" 
             class="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-8 flex flex-col justify-between hover:shadow-xl transition-all group"
             [ngClass]="calcularStatus(plano.proxima_em).border">
          
          <div>
            <div class="flex justify-between items-start mb-4">
              <span class="px-3 py-1 bg-gray-100 text-[#02464a] text-xs font-bold rounded-lg uppercase">
                ID: {{ plano.equipamento?.id }}
              </span>
              <span [ngClass]="calcularStatus(plano.proxima_em).cor" 
                    class="px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 uppercase">
                
                <!-- Icon mapping based on label -->
                <ng-container [ngSwitch]="calcularStatus(plano.proxima_em).label">
                  <svg *ngSwitchCase="'ATRASADO'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <svg *ngSwitchCase="'CRÍTICO'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <svg *ngSwitchCase="'EM DIA'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </ng-container>

                {{ calcularStatus(plano.proxima_em).label }}
              </span>
            </div>

            <h3 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#02464a] transition-colors">
              {{ plano.titulo }}
            </h3>
            
            <div class="mb-4 min-h-[50px]">
              <div *ngIf="plano.descricao" class="bg-gray-50 border-l-4 border-[#02464a]/30 p-2 rounded-r-lg">
                <label class="text-[10px] uppercase font-bold text-[#02464a]/60 block mb-1">Descrição:</label>
                <p class="text-sm text-gray-700 italic line-clamp-2">"{{ plano.descricao }}"</p>
              </div>
            </div>

            <div class="space-y-3 mb-6 text-sm">
              <p class="flex items-center gap-2"><span class="text-gray-400">📅</span> Próxima: <b>{{ plano.proxima_em | date:'dd/MM/yyyy' }}</b></p>
              <p class="flex items-center gap-2"><span class="text-gray-400">👤</span> Técnico: <b>{{ plano.tecnico?.nome || 'Não atribuído' }}</b></p>
            </div>
          </div>

          <button [routerLink]="['/app/execucoes/nova']" 
                  [queryParams]="{ planoId: plano.id, titulo: plano.titulo, tecnico: plano.tecnico?.nome }"
                  [style.background-color]="'#02464a'"
                  class="w-full py-3 text-white font-bold rounded-xl hover:brightness-125 transition-all shadow-md shadow-[#02464a]/10 active:scale-95">
            Registrar Manutenção
          </button>
        </div>
      </div>

      <div *ngIf="planosFiltrados().length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
        <h3 class="text-lg font-medium text-gray-400">Nenhum plano encontrado neste filtro.</h3>
      </div>

    </div>
  `
})
export class PlanosListComponent implements OnInit {
  private planoService = inject(PlanoService);
  
  planos = signal<any[]>([]);
  filtroAtual = signal<'todos' | 'atrasados' | 'criticos'>('todos');

  planosFiltrados = computed(() => {
    const todos = this.planos();
    const filtro = this.filtroAtual();

    if (filtro === 'todos') return todos;

    return todos.filter(plano => {
      const status = this.calcularStatus(plano.proxima_em).label;
      if (filtro === 'atrasados') return status === 'ATRASADO';
      if (filtro === 'criticos') return status === 'CRÍTICO';
      return true;
    });
  });

  ngOnInit(): void {
    this.carregarPlanos();
  }

  carregarPlanos(): void {
    this.planoService.listar().subscribe({
      next: (res) => this.planos.set(res),
      error: (err) => console.error('Erro ao listar:', err)
    });
  }

  calcularStatus(dataProxima: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataManutencao = new Date(dataProxima);
    
    const diffInMs = dataManutencao.getTime() - hoje.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 0) {
      return { label: 'ATRASADO', cor: 'text-red-700 bg-red-50 border-red-200', border: 'border-red-500', icon: '⚠️' };
    } else if (diffInDays <= 7) {
      return { label: 'CRÍTICO', cor: 'text-orange-700 bg-orange-50 border-orange-200', border: 'border-orange-500', icon: '⏳' };
    } else {
      return { label: 'EM DIA', cor: 'text-green-700 bg-green-50 border-green-200', border: 'border-green-500', icon: '✅' };
    }
  }
}