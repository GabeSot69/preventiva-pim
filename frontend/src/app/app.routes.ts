import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'app/planos', pathMatch: 'full' },
  { 
    path: 'app/planos', 
    loadComponent: () => import('./pages/planos-list/planos-list.component').then(m => m.PlanosListComponent) 
  },
  { 
    path: 'app/planos/novo', 
    loadComponent: () => import('./pages/planos-form/planos-form.component').then(m => m.PlanosFormComponent) 
  },
  { 
    path: 'app/planos/:id', 
    loadComponent: () => import('./pages/planos-detail/planos-detail.component').then(m => m.PlanosDetailComponent) 
  },
  { 
    path: 'app/execucoes/nova', 
    loadComponent: () => import('./pages/execucao-form/execucao-form.component').then(m => m.ExecucaoFormComponent) 
  },
  { path: '**', redirectTo: 'app/planos' } 
];