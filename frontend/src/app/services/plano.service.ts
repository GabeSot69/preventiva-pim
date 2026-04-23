import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanoService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/planos';

  // Este método precisa existir com este nome exato:
  criar(plano: any): Observable<any> {
    return this.http.post<any>(this.API, plano);
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.API);
  }
}