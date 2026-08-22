import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AuthResponse, LoginReq, RegisterReq } from '../Models/Auth';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/Auth`;

  private authState = signal<AuthResponse | null>(this.readStoredAuth());

  isLoggedIn = computed(() => !!this.authState());
  isAdmin = computed(() => this.authState()?.role === 'Admin');
  username = computed(() => this.authState()?.username ?? null);
  role = computed(() => this.authState()?.role ?? null);

  constructor(private http: HttpClient) {}

  login(data: LoginReq) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, data)
      .pipe(tap((res) => this.setAuth(res)));
  }

  register(data: RegisterReq) {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, data)
      .pipe(tap((res) => this.setAuth(res)));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.authState.set(null);
  }

  get token(): string | null {
    return this.authState()?.token ?? null;
  }

  private setAuth(res: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.authState.set(res);
  }

  private readStoredAuth(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed: AuthResponse = JSON.parse(raw);
      if (new Date(parsed.expiresAtUtc).getTime() <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
