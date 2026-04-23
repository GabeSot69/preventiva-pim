import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlanoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/planos';

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  criar(plano: any): Observable<any> {
    return this.http.post<any>(this.API, plano, { headers: this.getHeaders() });
  }

  listar(filtros: any = {}): Observable<any[]> {
    let params = '';
    if (Object.keys(filtros).length > 0) {
      params = '?' + Object.entries(filtros)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
    }
    return this.http.get<any>(`${this.API}${params}`, { headers: this.getHeaders() }).pipe(
      map(res => res.data)
    );
  }

  obterPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`, { headers: this.getHeaders() });
  }
  }