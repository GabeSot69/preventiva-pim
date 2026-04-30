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
  refreshTokenValue = signal<string | null>(localStorage.getItem('refreshToken'));
  usuario = signal<any | null>(JSON.parse(localStorage.getItem('usuario') || 'null'));

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        if (res.tokenAcesso) {
          this.saveTokens(res.tokenAcesso, res.refreshToken, res.usuario);
        }
      })
    );
  }

  refreshToken(): Observable<any> {
    const rt = this.refreshTokenValue();
    return this.http.post<any>(`${this.API}/refresh`, { refreshToken: rt }).pipe(
      tap(res => {
        if (res.tokenAcesso) {
          this.saveTokens(res.tokenAcesso, res.refreshToken, this.usuario());
        }
      })
    );
  }

  private saveTokens(token: string, refreshToken: string, usuario: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.token.set(token);
    this.refreshTokenValue.set(refreshToken);
    this.usuario.set(usuario);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    this.token.set(null);
    this.refreshTokenValue.set(null);
    this.usuario.set(null);
  }

  getUsuario() {
    return this.usuario();
  }

  getToken() {
    return this.token();
  }
}
