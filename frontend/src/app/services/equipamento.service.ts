import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/equipamentos';

  private getHeaders() {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  listar(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.API}?page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  obterPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`, { headers: this.getHeaders() });
  }

  criar(equipamento: any): Observable<any> {
    return this.http.post<any>(this.API, equipamento, { headers: this.getHeaders() });
  }

  atualizar(id: number, equipamento: any): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}`, equipamento, { headers: this.getHeaders() });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`, { headers: this.getHeaders() });
  }
}
