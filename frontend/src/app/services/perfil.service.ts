import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly API = 'http://localhost:3000/app/perfis';

  private getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.API, { headers: this.getHeaders() });
  }
}
