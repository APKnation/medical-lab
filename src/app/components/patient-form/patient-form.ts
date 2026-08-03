import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { LabTestService } from '../../services/lab-test.service';
import { AuthService } from '../../services/auth.service';
import { Patient, PatientTest } from '../../models/patient.model';
import { LabTest } from '../../models/lab-test.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './patient-form.html',
})
export class PatientFormComponent implements OnInit {
  private patientSvc = inject(PatientService);
  private labTestSvc = inject(LabTestService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  patientId: string | null = null;
  saving = signal(false);
  saved = signal(false);

  availableTests: LabTest[] = [];
  selectedTestCode = '';

  // Form model
  form: Omit<Patient, 'id' | 'patientId' | 'status' | 'dateRegistered' | 'createdBy'> = {
    name: '',
    age: 0,
    gender: 'Male',
    contact: '',
    address: '',
    doctorName: '',
    doctorContact: '',
    referredFrom: '',
    priority: 'Normal',
    tests: [],
    notes: '',
  };

  ngOnInit(): void {
    this.availableTests = this.labTestSvc.getAll();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit = true;
      this.patientId = id;
      const patient = this.patientSvc.getById(id);
      if (patient) {
        const { id: _, patientId: __, status, dateRegistered, createdBy, ...rest } = patient;
        this.form = { ...rest };
      } else {
        this.router.navigate(['/patients']);
      }
    }
  }

  addTest(): void {
    if (!this.selectedTestCode) return;
    const existing = this.form.tests.find((t) => t.testCode === this.selectedTestCode);
    if (existing) {
      alert('This test has already been added.');
      return;
    }
    const labTest = this.labTestSvc.getByCode(this.selectedTestCode);
    if (!labTest) return;
    const test: PatientTest = {
      id: this.patientSvc.generateId(),
      testCode: labTest.code,
      testName: labTest.name,
      category: labTest.category,
      status: 'Pending',
      parameters: this.labTestSvc.getDefaultParameters(labTest.code, this.form.gender),
    };
    this.form.tests = [...this.form.tests, test];
    this.selectedTestCode = '';
  }

  removeTest(testId: string): void {
    this.form.tests = this.form.tests.filter((t) => t.id !== testId);
  }

  isTestAdded(code: string): boolean {
    return this.form.tests.some((t) => t.testCode === code);
  }

  onSubmit(): void {
    if (!this.form.name.trim() || !this.form.doctorName.trim() || this.form.tests.length === 0) {
      alert('Please fill in Patient Name, Doctor Name, and add at least one test.');
      return;
    }

    this.saving.set(true);
    setTimeout(() => {
      const staff = this.auth.currentStaff();
      if (this.isEdit && this.patientId) {
        const existing = this.patientSvc.getById(this.patientId)!;
        const updated: Patient = {
          ...existing,
          ...this.form,
        };
        this.patientSvc.update(updated);
      } else {
        const newPatient: Patient = {
          id: this.patientSvc.generateId(),
          patientId: this.patientSvc.generatePatientId(),
          status: 'Pending',
          dateRegistered: new Date().toISOString(),
          createdBy: staff?.username ?? 'unknown',
          ...this.form,
        };
        this.patientSvc.add(newPatient);
      }
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => {
        this.router.navigate(['/patients']);
      }, 1200);
    }, 700);
  }
}
