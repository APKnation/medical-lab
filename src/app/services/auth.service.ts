import { Injectable, computed, signal } from '@angular/core';
import { Staff } from '../models/staff.model';

const STAFF_ACCOUNTS: Staff[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Dr. James Okonkwo',
    role: 'Admin',
    designation: 'Laboratory Director',
  },
  {
    id: '2',
    username: 'labtech',
    password: 'lab@2025',
    name: 'Sarah Kimani',
    role: 'Lab Technician',
    designation: 'Senior Lab Technician',
  },
  {
    id: '3',
    username: 'nurse',
    password: 'nurse@2025',
    name: 'Mary Wanjiku',
    role: 'Lab Technician',
    designation: 'Lab Assistant',
  },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _currentStaff = signal<Staff | null>(null);

  readonly currentStaff = this._currentStaff.asReadonly();
  readonly isAuthenticated = computed(() => this._currentStaff() !== null);
  readonly isAdmin = computed(() => this._currentStaff()?.role === 'Admin');

  constructor() {
    const saved = localStorage.getItem('lab_session');
    if (saved) {
      try {
        this._currentStaff.set(JSON.parse(saved));
      } catch {
        localStorage.removeItem('lab_session');
      }
    }
  }

  login(username: string, password: string): boolean {
    const staff = STAFF_ACCOUNTS.find(
      (s) => s.username === username && s.password === password
    );
    if (staff) {
      this._currentStaff.set(staff);
      localStorage.setItem('lab_session', JSON.stringify(staff));
      return true;
    }
    return false;
  }

  logout(): void {
    this._currentStaff.set(null);
    localStorage.removeItem('lab_session');
  }

  getStaffAccounts(): Omit<Staff, 'password'>[] {
    return STAFF_ACCOUNTS.map(({ password, ...s }) => s);
  }
}
