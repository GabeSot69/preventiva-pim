import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/usuarios';

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  listar(): Observable<any[]> {
    return this.http.get<any>(this.API, { headers: this.getHeaders() }).pipe(
      map(res => res.data)
    );
  }

  obterPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`, { headers: this.getHeaders() }).pipe(
      map(res => res.data)
    );
  }

  criar(dados: any): Observable<any> {
    return this.http.post<any>(this.API, dados, { headers: this.getHeaders() });
  }

  atualizar(id: number, dados: any): Observable<any> {
    return this.http.put<any>(`${this.API}/${id}`, dados, { headers: this.getHeaders() });
  }

  excluir(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/${id}`, { headers: this.getHeaders() });
  }
}
