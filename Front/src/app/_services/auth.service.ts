import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestResponse } from 'src/interface';

interface NewRequest {
  name: string;
  senderAddress: string;
  recipientAddress: string;
  productType: string;
  requestDate: string;// Change to string if you will store as string
  requestTime: string;
  productSize: string;
  productImage: File | null;
}





const AUTH_API = 'http://localhost:8080/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // getNearbyRequests(origin: string, destination: string) {
  //   throw new Error('Method not implemented.');
  // }
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





  request(newRequest:NewRequest): Observable<any> {
    return this.http.post(
      AUTH_API + 'api/auth/request',{
        newRequest
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

  submitDelivererRequest(delivererData: any): Observable<any> {
    return this.http.post(
      AUTH_API + 'api/auth/save-deliverer',
      { delivererData },
      httpOptions
    );
  }





}
