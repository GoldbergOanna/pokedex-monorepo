import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { RequestOptions } from '../auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseurl = 'http://localhost:3000';

  //Helpers

  //GET
  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(`${this.baseurl}/${endpoint}`, options);
  }

  //POST
  post<T, B extends object>(
    endpoint: string,
    body: B,
    options?: RequestOptions,
  ): Observable<T> {
    return this.http.post<T>(`${this.baseurl}/${endpoint}`, body, options);
  }

  //PUT
  put<T, B extends object>(
    endpoint: string,
    body: B,
    options?: RequestOptions,
  ): Observable<T> {
    return this.http.put<T>(`${this.baseurl}/${endpoint}`, body, options);
  }

  //DELETE
  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.baseurl}/${endpoint}`, options);
  }
}
