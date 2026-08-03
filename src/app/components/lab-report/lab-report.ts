import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient, PatientTest, TestResultParameter } from '../../models/patient.model';

@Component({
  selector: 'app-lab-report',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lab-report.html',
})
export class LabReportComponent implements OnInit {
  private patientSvc = inject(PatientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  patient = signal<Patient | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/patients']); return; }
    const p = this.patientSvc.getById(id);
    if (!p) { this.router.navigate(['/patients']); return; }
    this.patient.set(p);
  }

  printReport(): void {
    window.print();
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  formatDateTime(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  getFlagDisplay(flag: string): string {
    return { High: 'H ↑', Low: 'L ↓', Positive: 'POS', Negative: 'NEG', Normal: '', Abnormal: 'ABN', '': '' }[flag] ?? '';
  }

  getFlagClass(flag: string): string {
    return (
      {
        High: 'flag-high',
        Low: 'flag-low',
        Positive: 'flag-high',
        Normal: '',
        Negative: '',
        Abnormal: 'flag-abnormal',
        '': '',
      }[flag] ?? ''
    );
  }

  hasAbnormalResults(test: PatientTest): boolean {
    return test.parameters.some((p) => p.flag === 'High' || p.flag === 'Low' || p.flag === 'Positive' || p.flag === 'Abnormal');
  }

  get completedTests() {
    return this.patient()?.tests.filter((t) => t.status === 'Completed') ?? [];
  }
}
