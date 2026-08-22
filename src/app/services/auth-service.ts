import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
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

  /** Exchanges the stored (single-use) refresh token for a new access + refresh token pair. */
  refresh() {
    const refreshToken = this.authState()?.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(tap((res) => this.setAuth(res)));
  }

  /** Invalidates the refresh token server-side, then clears local state regardless of whether
   * that call succeeds (e.g. the access token used to authorize it is already expired). */
  logout() {
    // Fire the revoke call first, while the (still valid, if unexpired) access token is still in
    // storage for the auth interceptor to attach — clearing local state first would send it
    // unauthenticated and it would just 401.
    if (this.isLoggedIn()) {
      this.http
        .post(`${this.baseUrl}/revoke`, {})
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.clearAuth();
  }

  get token(): string | null {
    return this.authState()?.token ?? null;
  }

  private setAuth(res: AuthResponse) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.authState.set(res);
  }

  private clearAuth() {
    localStorage.removeItem(STORAGE_KEY);
    this.authState.set(null);
  }

  private readStoredAuth(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      // Only the short-lived access token in here may already be expired — that's expected and
      // handled by the 401 -> refresh flow in the error interceptor. Don't wipe the (still valid
      // for days) refresh token just because of that.
      return JSON.parse(raw) as AuthResponse;
    } catch {
      return null;
    }
  }
}
