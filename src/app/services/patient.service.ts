import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Patient, PatientTest, TestResultParameter } from '../models/patient.model';
import { API_BASE_URL } from '../core/api.config';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private _patients = signal<Patient[]>([]);
  readonly patients = this._patients.asReadonly();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.loadFromApi();
  }

  async loadFromApi(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<Patient[]>(`${API_BASE_URL}/patients/`)
      );
      this._patients.set(response);
    } catch {
      this._patients.set([]);
    }
  }

  async getById(id: string): Promise<Patient | undefined> {
    try {
      const response = await firstValueFrom(
        this.http.get<Patient>(`${API_BASE_URL}/patients/${id}/`)
      );
      return response;
    } catch {
      return undefined;
    }
  }

  async getAll(): Promise<Patient[]> {
    const cached = this._patients();
    if (cached.length > 0) return cached;
    await this.loadFromApi();
    return this._patients();
  }

  async add(patient: Omit<Patient, 'id' | 'patientId' | 'status' | 'dateRegistered' | 'dateCompleted' | 'createdBy'>): Promise<Patient | null> {
    try {
      const staff = this.auth.currentStaff();
      const data: any = {
        ...patient,
        createdBy: staff?.username ?? 'unknown',
      };
      const response = await firstValueFrom(
        this.http.post<Patient>(`${API_BASE_URL}/patients/`, data)
      );
      const current = this._patients();
      this._patients.set([response, ...current]);
      return response;
    } catch {
      return null;
    }
  }

  async update(patient: Patient): Promise<boolean> {
    try {
      const { id, ...data } = patient;
      const response = await firstValueFrom(
        this.http.put<Patient>(`${API_BASE_URL}/patients/${id}/`, data)
      );
      const current = this._patients();
      const idx = current.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const updated = [...current];
        updated[idx] = response;
        this._patients.set(updated);
      }
      return true;
    } catch {
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.delete(`${API_BASE_URL}/patients/${id}/`)
      );
      const current = this._patients();
      this._patients.set(current.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  async updateTestParameters(testId: string, parameters: TestResultParameter[]): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${API_BASE_URL}/tests/${testId}/update_parameters/`, {
          parameters: parameters.map((p) => ({
            name: p.name,
            value: p.value,
            unit: p.unit,
            normalRange: p.normalRange,
          }))
        })
      );
      return true;
    } catch {
      return false;
    }
  }

  async completeTest(testId: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.post(`${API_BASE_URL}/tests/${testId}/complete_test/`, {})
      );
      return true;
    } catch {
      return false;
    }
  }

  async recalculateStatus(patientId: string): Promise<Patient | null> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; status: string }>(
          `${API_BASE_URL}/patients/${patientId}/recalculate_status/`,
          {}
        )
      );
      if (response.success) {
        const patient = await this.getById(patientId);
        if (patient) {
          const current = this._patients();
          const idx = current.findIndex((p) => p.id === patientId);
          if (idx >= 0) {
            const updated = [...current];
            updated[idx] = patient;
            this._patients.set(updated);
          }
        }
        return patient ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }

  getStats() {
    const all = this._patients();
    const today = new Date().toDateString();
    return {
      total: all.length,
      pending: all.filter((p) => p.status === 'Pending').length,
      inProgress: all.filter((p) => p.status === 'In Progress').length,
      completed: all.filter((p) => p.status === 'Completed').length,
      todayCount: all.filter((p) => new Date(p.dateRegistered).toDateString() === today).length,
      urgent: all.filter((p) => p.priority === 'Urgent').length,
    };
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  generatePatientId(): string {
    const year = new Date().getFullYear();
    const count = this._patients().length + 1;
    return `LCL-${year}-${String(count).padStart(4, '0')}`;
  }

  recalculateStatusLocal(patient: Patient): Patient {
    const tests = patient.tests;
    if (tests.length === 0) return patient;
    const allCompleted = tests.every((t) => t.status === 'Completed');
    const anyInProgress = tests.some((t) => t.status === 'In Progress' || t.status === 'Completed');
    return {
      ...patient,
      status: allCompleted ? 'Completed' : anyInProgress ? 'In Progress' : 'Pending',
      dateCompleted: allCompleted && !patient.dateCompleted ? new Date().toISOString() : patient.dateCompleted,
    };
  }
}
