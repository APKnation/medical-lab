import { Injectable, signal } from '@angular/core';
import { Patient, PatientTest, TestResultParameter } from '../models/patient.model';

const STORAGE_KEY = 'lifecare_patients';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private _patients = signal<Patient[]>([]);
  readonly patients = this._patients.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data) as Patient[];
        const normalized = this.normalizePatients(parsed);
        this._patients.set(normalized);
        if (JSON.stringify(normalized) !== data) {
          this.saveToStorage();
        }
      } catch {
        this._patients.set([]);
      }
    } else {
      this._patients.set(this.getSeedData());
      this.saveToStorage();
    }
  }

  private normalizePatients(patients: Patient[]): Patient[] {
    return patients.map((patient) => {
      const normalizedPatient = { ...patient };

      if (normalizedPatient.name === 'John Mwangi' || normalizedPatient.name === 'Fatuma Achieng' || normalizedPatient.name === 'Grace Nyambura') {
        normalizedPatient.name = normalizedPatient.name === 'John Mwangi'
          ? 'Atanas'
          : normalizedPatient.name === 'Fatuma Achieng'
            ? 'Elia'
            : 'Asheri';
      }

      if (
        normalizedPatient.doctorName === 'Dr. Amina Hassan' ||
        normalizedPatient.doctorName === 'Dr. Peter Kamau' ||
        normalizedPatient.doctorName === 'Dr. David Ochieng' ||
        normalizedPatient.doctorName === 'Dr. Achien' ||
        normalizedPatient.doctorName.includes('Achien')
      ) {
        normalizedPatient.doctorName = 'Dr. Elestia Patrick';
      }

      if (normalizedPatient.name === 'Atanas' && normalizedPatient.doctorName === 'Dr. Elestia Patrick') {
        normalizedPatient.doctorName = 'Dr. Ezekieli';
      }

      return normalizedPatient;
    });
  }

  private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._patients()));
  }

  getAll(): Patient[] {
    return this._patients();
  }

  getById(id: string): Patient | undefined {
    return this._patients().find((p) => p.id === id);
  }

  add(patient: Patient): Patient {
    const updated = [...this._patients(), patient];
    this._patients.set(updated);
    this.saveToStorage();
    return patient;
  }

  update(patient: Patient): void {
    const list = this._patients().map((p) => (p.id === patient.id ? patient : p));
    this._patients.set(list);
    this.saveToStorage();
  }

  delete(id: string): void {
    const list = this._patients().filter((p) => p.id !== id);
    this._patients.set(list);
    this.saveToStorage();
  }

  generatePatientId(): string {
    const year = new Date().getFullYear();
    const count = this._patients().length + 1;
    return `LCL-${year}-${String(count).padStart(4, '0')}`;
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  recalculateStatus(patient: Patient): Patient {
    const tests = patient.tests;
    if (tests.length === 0) return patient;
    const allCompleted = tests.every((t) => t.status === 'Completed');
    const anyInProgress = tests.some(
      (t) => t.status === 'In Progress' || t.status === 'Completed'
    );
    return {
      ...patient,
      status: allCompleted
        ? 'Completed'
        : anyInProgress
          ? 'In Progress'
          : 'Pending',
      dateCompleted: allCompleted ? new Date().toISOString() : patient.dateCompleted,
    };
  }

  getStats() {
    const all = this._patients();
    const today = new Date().toDateString();
    return {
      total: all.length,
      pending: all.filter((p) => p.status === 'Pending').length,
      inProgress: all.filter((p) => p.status === 'In Progress').length,
      completed: all.filter((p) => p.status === 'Completed').length,
      todayCount: all.filter(
        (p) => new Date(p.dateRegistered).toDateString() === today
      ).length,
      urgent: all.filter((p) => p.priority === 'Urgent').length,
    };
  }

  private getSeedData(): Patient[] {
    return [
      {
        id: 'seed1',
        patientId: 'LCL-2025-0001',
        name: 'Atanas',
        age: 45,
        gender: 'Male',
        contact: '+254 701 234 567',
        address: 'Nairobi, Kenya',
        doctorName: 'Dr. Ezekieli',
        doctorContact: '+254 722 111 222',
        referredFrom: 'Nairobi General Hospital',
        priority: 'Normal',
        status: 'Completed',
        dateRegistered: new Date(Date.now() - 2 * 86400000).toISOString(),
        dateCompleted: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
        notes: '',
        createdBy: 'admin',
        tests: [
          {
            id: 'st1',
            testCode: 'CBC',
            testName: 'Complete Blood Count',
            category: 'Hematology',
            status: 'Completed',
            completedAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(),
            completedBy: 'labtech',
            parameters: [
              { name: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRange: '13.5 – 17.5', flag: 'Normal' },
              { name: 'WBC', value: '7.2', unit: 'x10³/μL', normalRange: '4.5 – 11.0', flag: 'Normal' },
              { name: 'RBC', value: '5.1', unit: 'x10⁶/μL', normalRange: '4.5 – 5.9', flag: 'Normal' },
              { name: 'Platelets', value: '220', unit: 'x10³/μL', normalRange: '150 – 400', flag: 'Normal' },
              { name: 'Hematocrit', value: '44', unit: '%', normalRange: '41 – 53', flag: 'Normal' },
              { name: 'MCV', value: '88', unit: 'fL', normalRange: '80 – 100', flag: 'Normal' },
              { name: 'MCH', value: '29', unit: 'pg', normalRange: '27 – 33', flag: 'Normal' },
              { name: 'MCHC', value: '34', unit: 'g/dL', normalRange: '32 – 36', flag: 'Normal' },
              { name: 'Neutrophils', value: '60', unit: '%', normalRange: '50 – 70', flag: 'Normal' },
              { name: 'Lymphocytes', value: '32', unit: '%', normalRange: '20 – 40', flag: 'Normal' },
            ],
          },
          {
            id: 'st2',
            testCode: 'LP',
            testName: 'Lipid Profile',
            category: 'Clinical Chemistry',
            status: 'Completed',
            completedAt: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString(),
            completedBy: 'labtech',
            parameters: [
              { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', normalRange: '< 200', flag: 'High' },
              { name: 'LDL Cholesterol', value: '128', unit: 'mg/dL', normalRange: '< 130', flag: 'Normal' },
              { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', normalRange: '> 40', flag: 'Normal' },
              { name: 'Triglycerides', value: '145', unit: 'mg/dL', normalRange: '< 150', flag: 'Normal' },
              { name: 'VLDL', value: '29', unit: 'mg/dL', normalRange: '2 – 30', flag: 'Normal' },
            ],
          },
        ],
      },
      {
        id: 'seed2',
        patientId: 'LCL-2025-0002',
        name: 'Elia',
        age: 32,
        gender: 'Female',
        contact: '+254 712 345 678',
        address: 'Mombasa, Kenya',
        doctorName: 'Dr. Elestia Patrick',
        doctorContact: '+254 733 222 333',
        referredFrom: 'Coastal Medical Centre',
        priority: 'Urgent',
        status: 'In Progress',
        dateRegistered: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Patient fasting for 12 hours prior to sample collection.',
        createdBy: 'admin',
        tests: [
          {
            id: 'st3',
            testCode: 'BG-F',
            testName: 'Blood Glucose (Fasting)',
            category: 'Clinical Chemistry',
            status: 'Completed',
            completedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
            completedBy: 'labtech',
            parameters: [
              { name: 'Fasting Blood Glucose', value: '128', unit: 'mg/dL', normalRange: '70 – 100', flag: 'High' },
            ],
          },
          {
            id: 'st4',
            testCode: 'LFT',
            testName: 'Liver Function Tests',
            category: 'Clinical Chemistry',
            status: 'Pending',
            parameters: [
              { name: 'ALT (SGPT)', value: '', unit: 'U/L', normalRange: '7 – 56', flag: '' },
              { name: 'AST (SGOT)', value: '', unit: 'U/L', normalRange: '10 – 40', flag: '' },
              { name: 'Alkaline Phosphatase', value: '', unit: 'U/L', normalRange: '44 – 147', flag: '' },
              { name: 'Total Bilirubin', value: '', unit: 'mg/dL', normalRange: '0.2 – 1.2', flag: '' },
              { name: 'Direct Bilirubin', value: '', unit: 'mg/dL', normalRange: '0.0 – 0.3', flag: '' },
              { name: 'Total Protein', value: '', unit: 'g/dL', normalRange: '6.0 – 8.3', flag: '' },
              { name: 'Albumin', value: '', unit: 'g/dL', normalRange: '3.5 – 5.0', flag: '' },
            ],
          },
        ],
      },
      {
        id: 'seed3',
        patientId: 'LCL-2025-0003',
        name: 'Asheri',
        age: 28,
        gender: 'Female',
        contact: '+254 798 456 789',
        address: 'Kisumu, Kenya',
        doctorName: 'Dr. Elestia Patrick',
        doctorContact: '+254 744 333 444',
        referredFrom: 'Western Regional Hospital',
        priority: 'Normal',
        status: 'Pending',
        dateRegistered: new Date().toISOString(),
        notes: '',
        createdBy: 'admin',
        tests: [
          {
            id: 'st5',
            testCode: 'UA',
            testName: 'Urinalysis',
            category: 'Urinalysis',
            status: 'Pending',
            parameters: [
              { name: 'Color', value: '', unit: '', normalRange: 'Yellow', flag: '' },
              { name: 'Clarity', value: '', unit: '', normalRange: 'Clear', flag: '' },
              { name: 'pH', value: '', unit: '', normalRange: '4.5 – 8.0', flag: '' },
              { name: 'Specific Gravity', value: '', unit: '', normalRange: '1.001 – 1.035', flag: '' },
              { name: 'Protein', value: '', unit: '', normalRange: 'Negative', flag: '' },
              { name: 'Glucose', value: '', unit: '', normalRange: 'Negative', flag: '' },
              { name: 'Ketones', value: '', unit: '', normalRange: 'Negative', flag: '' },
              { name: 'Blood', value: '', unit: '', normalRange: 'Negative', flag: '' },
              { name: 'Nitrites', value: '', unit: '', normalRange: 'Negative', flag: '' },
              { name: 'WBC (Microscopy)', value: '', unit: '/HPF', normalRange: '0 – 5', flag: '' },
              { name: 'RBC (Microscopy)', value: '', unit: '/HPF', normalRange: '0 – 2', flag: '' },
            ],
          },
        ],
      },
    ];
  }
}
