import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, shareReplay } from 'rxjs';
import { Staff } from '../models/staff.model';
import { API_BASE_URL } from '../core/api.config';

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    designation: string;
  };
  access_token: string;
  refresh_token: string;
  session_token: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentStaff = signal<Staff | null>(null);
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _sessionToken = signal<string | null>(null);

  readonly currentStaff = this._currentStaff.asReadonly();
  readonly isAuthenticated = computed(() => this._currentStaff() !== null);
  readonly isAdmin = computed(() => this._currentStaff()?.role === 'Admin');
  readonly accessToken = this._accessToken.asReadonly();

  private _staffAccounts: Staff[] = [];

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem('lab_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const staff = parsed.user as Staff;
        if (staff) {
          const normalized = this.normalizeStaff(parsed);
          this._currentStaff.set(normalized);
          this._accessToken.set(parsed.access_token ?? null);
          this._refreshToken.set(parsed.refresh_token ?? null);
          this._sessionToken.set(parsed.session_token ?? null);
          if (JSON.stringify(parsed) !== saved) {
            localStorage.setItem('lab_session', JSON.stringify(parsed));
          }
        } else {
          localStorage.removeItem('lab_session');
        }
      } catch {
        localStorage.removeItem('lab_session');
      }
    }
  }

  private normalizeStaff(data: { user: Staff }): Staff {
    const staff = data.user;
    if (staff.username === 'admin') {
      return { ...staff, name: 'Atanas' };
    }
    if (staff.username === 'labtech') {
      return { ...staff, name: 'Elia Asheri' };
    }
    if (staff.username === 'nurse') {
      return { ...staff, name: 'Ezekieli Elestia Patrick' };
    }
    return staff;
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login/`, {
          username,
          password,
        })
      );

      if (response.success) {
        const staff: Staff = {
          id: response.user.id,
          username: response.user.username,
          password: '',
          name: response.user.name,
          role: response.user.role as Staff['role'],
          designation: response.user.designation,
        };
        this._currentStaff.set(staff);
        this._accessToken.set(response.access_token);
        this._refreshToken.set(response.refresh_token);
        this._sessionToken.set(response.session_token);

        const sessionData = {
          user: response.user,
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          session_token: response.session_token,
        };
        localStorage.setItem('lab_session', JSON.stringify(sessionData));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    const sessionToken = this._sessionToken();
    if (sessionToken) {
      try {
        await firstValueFrom(
          this.http.post(`${API_BASE_URL}/auth/logout/`, {
            session_token: sessionToken,
          })
        );
      } catch {
        // Continue with local logout even if API call fails
      }
    }
    this._currentStaff.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._sessionToken.set(null);
    localStorage.removeItem('lab_session');
  }

  async refreshSession(): Promise<boolean> {
    const refreshToken = this._refreshToken();
    if (!refreshToken) return false;
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        })
      );
      if (response.access_token) {
        this._accessToken.set(response.access_token);
        const saved = JSON.parse(localStorage.getItem('lab_session') ?? '{}');
        saved.access_token = response.access_token;
        localStorage.setItem('lab_session', JSON.stringify(saved));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
