import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EquipamentoService } from '../../services/equipamento.service';

@Component({
  selector: 'app-equipamentos-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/30">
      
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Equipamentos</h1>
          <p class="text-gray-500">Gerencie os ativos e máquinas cadastrados no sistema.</p>
        </div>
        <button routerLink="/app/equipamentos/novo" 
                [style.background-color]="'#02464a'"
                class="flex items-center justify-center gap-2 px-6 py-3 text-white font-bold rounded-2xl hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-[#02464a]/20">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Equipamento
        </button>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Código</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Localização</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr *ngFor="let eq of equipamentos()" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-6 py-4">
                <span class="font-mono text-sm font-bold text-[#02464a] bg-[#02464a]/10 px-2 py-1 rounded-lg">
                  {{ eq.codigo }}
                </span>
              </td>
              <td class="px-6 py-4 font-bold text-gray-800">{{ eq.nome }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ eq.tipo }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ eq.localizacao }}</td>
              <td class="px-6 py-4">
                <span [ngClass]="eq.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'"
                      class="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {{ eq.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button [routerLink]="['/app/equipamentos/editar', eq.id]"
                          class="p-2 text-gray-400 hover:text-[#02464a] hover:bg-[#02464a]/5 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button (click)="excluir(eq.id)"
                          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 6.6a1.72 1.72 0 0 1-1.72 1.68H11.42a1.72 1.72 0 0 1-1.72-1.68L9.36 9m1.72-6h3.84a.75.75 0 0 1 .75.75V4.5h-5.34V3.75a.75.75 0 0 1 .75-.75ZM4.5 4.5h15M10.125 10.125l4.5 4.5m0-4.5-4.5 4.5" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="equipamentos().length === 0">
              <td colspan="6" class="px-6 py-20 text-center text-gray-400 italic font-medium">
                Nenhum equipamento cadastrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class EquipamentosListComponent implements OnInit {
  private service = inject(EquipamentoService);
  equipamentos = signal<any[]>([]);

  ngOnInit(): void {
    this.carregar();
  }

  carregar() {
    this.service.listar().subscribe(res => this.equipamentos.set(res));
  }

  excluir(id: number) {
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
      this.service.excluir(id).subscribe(() => this.carregar());
    }
  }
}
