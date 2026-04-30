import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlanoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/planos';

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  listar(filtros: any = {}): Observable<any> {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filtros)) {
      if (v !== undefined && v !== null) params.set(k, String(v));
    }
    const qs = params.toString() ? `?${params}` : '';
    return this.http.get<any>(`${this.API}${qs}`, { headers: this.getHeaders() });
  }

  criar(plano: any): Observable<any> {
    return this.http.post<any>(this.API, plano, { headers: this.getHeaders() });
  }

  obterPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`, { headers: this.getHeaders() });
  }

  atualizar(id: number, plano: any): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}`, plano, { headers: this.getHeaders() });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`, { headers: this.getHeaders() });
  }
}
