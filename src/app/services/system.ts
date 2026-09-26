import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { InitializeSystemRequest } from '../models/initialize-system.model';
import { InitializeSystemResponse } from '../models/initialize-system-response.model';
import { ApiResponse } from '../interfaces/apiResponse';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private apiUrl = environment.urlApi;
  private http = inject(HttpClient);

  isInitialized(): Observable<boolean> {
    return this.http.get<ApiResponse<{ isInitialized: boolean }>>(
      `${this.apiUrl}/api/v1/setup/status`
    ).pipe(
      map(res => res.success && res.data?.isInitialized === true),
      catchError(() => of(false))
    );
  }

  initialize(data: InitializeSystemRequest): Observable<ApiResponse<InitializeSystemResponse>> {
    return this.http.post<ApiResponse<InitializeSystemResponse>>(`${this.apiUrl}/api/v1/setup/initialize`, data);
  }
}
