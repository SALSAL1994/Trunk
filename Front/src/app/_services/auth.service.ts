import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API = 'http://localhost:8080/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'api/auth/signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  register(username: string, email: string, password: string, roles: string[]): Observable<any> {
    return this.http.post(
      AUTH_API + 'register',
      {
        username,
        email,
        password,
        roles
      },
      httpOptions
    );
  }

  logout(): Observable<any> {

    localStorage.removeItem('authToken');
    return this.http.post(AUTH_API + 'signout', { }, httpOptions);
  }


  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }


  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }


  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
