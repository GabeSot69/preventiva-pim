import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExecucaoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/execucoes';

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  criar(execucao: any): Observable<any> {
    return this.http.post<any>(this.API, execucao, { headers: this.getHeaders() });
  }

  listar(page: number = 1, limit: number = 10): Observable<any[]> {
    return this.http.get<any>(`${this.API}?page=${page}&limit=${limit}`, { headers: this.getHeaders() }).pipe(
      map(res => res.data)
    );
  }
}
