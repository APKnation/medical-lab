import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class DashboardComponent {
  private patientSvc: PatientService = inject(PatientService);
  private auth: AuthService = inject(AuthService);

  readonly staff = this.auth.currentStaff;
  readonly stats = computed(() => this.patientSvc.getStats());
  readonly recentPatients = computed(() =>
    [...this.patientSvc.getAll()]
      .sort((a, b) => new Date(b.dateRegistered).getTime() - new Date(a.dateRegistered).getTime())
      .slice(0, 8)
  );

  getStatusClass(status: string): string {
    return {
      Pending: 'badge-pending',
      'In Progress': 'badge-progress',
      Completed: 'badge-completed',
    }[status] ?? 'badge-pending';
  }

  getPriorityClass(priority: string): string {
    return priority === 'Urgent'
      ? 'text-red-400 bg-red-500/10 border border-red-500/30'
      : 'text-slate-400 bg-slate-700/50 border border-slate-600/30';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}
