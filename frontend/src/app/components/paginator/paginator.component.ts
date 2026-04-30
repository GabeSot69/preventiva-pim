import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="totalPages() > 1" class="flex items-center justify-between px-2 py-4">
      <p class="text-sm text-gray-500">
        Página <b>{{ page() }}</b> de <b>{{ totalPages() }}</b> — <b>{{ total() }}</b> registros
      </p>
      <div class="flex gap-1">
        <button (click)="changePage(page() - 1)" [disabled]="page() === 1"
                class="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all">
          ‹
        </button>
        <ng-container *ngFor="let p of pages()">
          <button (click)="changePage(p)"
                  [ngClass]="p === page() ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'"
                  class="px-3 py-1.5 text-sm font-bold rounded-lg border transition-all">
            {{ p }}
          </button>
        </ng-container>
        <button (click)="changePage(page() + 1)" [disabled]="page() === totalPages()"
                class="px-3 py-1.5 text-sm font-bold rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all">
          ›
        </button>
      </div>
    </div>
  `
})
export class PaginatorComponent {
  page = input.required<number>();
  totalPages = input.required<number>();
  total = input.required<number>();
  pageChange = output<number>();

  pages() {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  changePage(p: number) {
    if (p >= 1 && p <= this.totalPages()) {
      this.pageChange.emit(p);
    }
  }
}
