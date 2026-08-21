import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LabTest, LabTestParameter } from '../models/lab-test.model';
import { TestResultParameter } from '../models/patient.model';
import { API_BASE_URL } from '../core/api.config';

@Injectable({ providedIn: 'root' })
export class LabTestService {
  private http = inject(HttpClient);
  private _catalog: LabTest[] = [];
  private _loaded = false;

  async getAll(): Promise<LabTest[]> {
    if (this._loaded && this._catalog.length > 0) {
      return this._catalog;
    }
    try {
      const response = await firstValueFrom(
        this.http.get<LabTest[]>(`${API_BASE_URL}/labtests/`)
      );
      this._catalog = response;
      this._loaded = true;
      return response;
    } catch {
      return this._catalog;
    }
  }

  async getByCode(code: string): Promise<LabTest | undefined> {
    if (!this._loaded) {
      await this.getAll();
    }
    return this._catalog.find((t) => t.code === code);
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<string[]>(`${API_BASE_URL}/labtests/categories/`)
      );
      return response;
    } catch {
      const all = await this.getAll();
      return [...new Set(all.map((t) => t.category))];
    }
  }

  async getDefaultParameters(testCode: string, gender?: string): Promise<TestResultParameter[]> {
    try {
      const params = new HttpParams()
        .set('test_code', testCode)
        .set('gender', gender ?? '');
      const response = await firstValueFrom(
        this.http.get<TestResultParameter[]>(`${API_BASE_URL}/labtests/default_parameters/`, {
          params,
        })
      );
      return response;
    } catch {
      // Fallback to local calculation
      const test = await this.getByCode(testCode);
      if (!test) return [];
      return test.parameters.map((p) => {
        let normalRange = p.normalRange;
        if (gender === 'Male' && (p as any).normalRangeMale) {
          normalRange = (p as any).normalRangeMale;
        }
        if (gender === 'Female' && (p as any).normalRangeFemale) {
          normalRange = (p as any).normalRangeFemale;
        }
        return {
          name: p.name,
          value: '',
          unit: p.unit,
          normalRange,
          flag: '',
        };
      });
    }
  }

  calculateFlag(
    value: string,
    normalRange: string
  ): 'Normal' | 'High' | 'Low' | 'Positive' | 'Negative' | 'Abnormal' | '' {
    if (!value || !normalRange) return '';

    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      const lv = value.toLowerCase().trim();
      const lr = normalRange.toLowerCase().trim();

      if (lr.includes('negative') || lr.includes('non-reactive')) {
        if (lv.includes('positive') || lv.includes('reactive')) return 'Positive';
        if (lv.includes('negative') || lv.includes('non-reactive')) return 'Negative';
        return 'Abnormal';
      }

      if (lv === lr) return 'Normal';
      return 'Abnormal';
    }

    const dashMatch = normalRange.match(/(\d+\.?\d*)\s*[–-]\s*(\d+\.?\d*)/);
    if (dashMatch) {
      const min = parseFloat(dashMatch[1]);
      const max = parseFloat(dashMatch[2]);
      if (numValue < min) return 'Low';
      if (numValue > max) return 'High';
      return 'Normal';
    }

    const gtMatch = normalRange.match(/[>≥]\s*(\d+\.?\d*)/);
    if (gtMatch) {
      const min = parseFloat(gtMatch[1]);
      return numValue < min ? 'Low' : 'Normal';
    }

    const ltMatch = normalRange.match(/[<≤]\s*(\d+\.?\d*)/);
    if (ltMatch) {
      const max = parseFloat(ltMatch[1]);
      return numValue > max ? 'High' : 'Normal';
    }

    return 'Normal';
  }
}
