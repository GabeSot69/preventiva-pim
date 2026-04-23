import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      <aside class="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        <div class="p-6">
          <div class="flex items-center gap-3 text-blue-600 mb-10">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg font-bold text-xl">P</div>
            <span class="font-black tracking-tighter text-xl text-gray-900">MANUT_PIM</span>
          </div>

          <nav class="space-y-2">
            <a routerLink="/app/planos" 
                routerLinkActive="bg-blue-600 text-white shadow-md shadow-blue-100" 
                [routerLinkActiveOptions]="{exact: true}"
                class="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all">
                
                <div class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.875-13.5h-1.875a3.375 3.375 0 0 1-3.375-3.375M16.5 21h-9a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25V18.75a2.25 2.25 0 0 1-2.25 2.25Z" />
                  </svg>
                  <span>Planos e Status</span>
                </div>

                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </a>            
          </nav>
        </div>

        <div class="mt-auto p-6 border-t border-gray-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">S</div>
            <div>
              <p class="text-xs font-black">Simone</p>
              <p class="text-[10px] text-gray-400">Analista de TI</p>
            </div>
          </div>
        </div>
      </aside>

      <main class="flex-1 overflow-y-auto bg-gray-50">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AppComponent {}