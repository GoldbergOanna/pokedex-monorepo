import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface RequestOptions {
  headers?: HttpHeaders | Record<string, string>;
  params?: HttpParams | Record<string, string | number | boolean>;
}
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}
