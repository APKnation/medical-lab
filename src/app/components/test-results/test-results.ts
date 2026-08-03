import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { LabTestService } from '../../services/lab-test.service';
import { AuthService } from '../../services/auth.service';
import { Patient, PatientTest, TestResultParameter } from '../../models/patient.model';

@Component({
  selector: 'app-test-results',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './test-results.html',
})
export class TestResultsComponent implements OnInit {
  private patientSvc: PatientService = inject(PatientService);
  private labTestSvc: LabTestService = inject(LabTestService);
  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  patient = signal<Patient | null>(null);
  saving = signal(false);
  activeTestId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/patients']); return; }
    const p = this.patientSvc.getById(id);
    if (!p) { this.router.navigate(['/patients']); return; }
    // Deep copy so we can edit locally
    this.patient.set(JSON.parse(JSON.stringify(p)));
    // Set first non-completed test as active
    const first = p.tests.find((t) => t.status !== 'Completed');
    if (first) this.activeTestId.set(first.id);
    else if (p.tests.length > 0) this.activeTestId.set(p.tests[0].id);
  }

  get activeTest(): PatientTest | null {
    return this.patient()?.tests.find((t) => t.id === this.activeTestId()) ?? null;
  }

  setActiveTest(id: string): void {
    this.activeTestId.set(id);
  }

  onValueChange(param: TestResultParameter): void {
    param.flag = this.labTestSvc.calculateFlag(param.value, param.normalRange);
  }

  markTestComplete(test: PatientTest): void {
    const staff = this.auth.currentStaff();
    test.status = 'Completed';
    test.completedAt = new Date().toISOString();
    test.completedBy = staff?.name ?? 'Unknown';
    this.patient.update((p) => p ? { ...p } : p);
  }

  getFlagClass(flag: string): string {
    return (
      {
        High: 'text-red-400 font-semibold',
        Low: 'text-blue-400 font-semibold',
        Positive: 'text-red-400 font-semibold',
        Negative: 'text-emerald-400',
        Normal: 'text-emerald-400',
        Abnormal: 'text-amber-400 font-semibold',
      }[flag] ?? 'text-slate-400'
    );
  }

  getFlagBadge(flag: string): string {
    return (
      {
        High: 'bg-red-500/15 text-red-400 border-red-500/30',
        Low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        Positive: 'bg-red-500/15 text-red-400 border-red-500/30',
        Negative: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        Normal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        Abnormal: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      }[flag] ?? 'bg-slate-700/50 text-slate-400 border-slate-600/30'
    );
  }

  saveResults(): void {
    const p = this.patient();
    if (!p) return;
    this.saving.set(true);
    setTimeout(() => {
      const updated = this.patientSvc.recalculateStatus(p);
      this.patientSvc.update(updated);
      this.saving.set(false);
      if (updated.status === 'Completed') {
        this.router.navigate(['/patients', updated.id, 'report']);
      } else {
        this.router.navigate(['/patients']);
      }
    }, 700);
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  getTestStatusClass(status: string): string {
    return (
      {
        Pending: 'badge-pending',
        'In Progress': 'badge-progress',
        Completed: 'badge-completed',
      }[status] ?? 'badge-pending'
    );
  }

  allTestsComplete(): boolean {
    return this.patient()?.tests.every((t) => t.status === 'Completed') ?? false;
  }
}
