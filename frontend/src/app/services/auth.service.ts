import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/app/auth';
  
  token = signal<string | null>(localStorage.getItem('token'));
  usuario = signal<any | null>(JSON.parse(localStorage.getItem('usuario') || 'null'));

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        if (res.tokenAcesso) {
          localStorage.setItem('token', res.tokenAcesso);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.token.set(res.tokenAcesso);
          this.usuario.set(res.usuario);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.token.set(null);
    this.usuario.set(null);
  }

  getUsuario() {
    return this.usuario();
  }

  getToken() {
    return this.token();
  }
}
