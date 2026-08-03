import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './patient-list.html',
})
export class PatientListComponent {
  private patientSvc: PatientService = inject(PatientService);
  private auth: AuthService = inject(AuthService);

  readonly isAdmin = this.auth.isAdmin;

  searchQuery = signal('');
  statusFilter = signal('All');
  priorityFilter = signal('All');

  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const sf = this.statusFilter();
    const pf = this.priorityFilter();
    return this.patientSvc.getAll().filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        p.contact.includes(q);
      const matchStatus = sf === 'All' || p.status === sf;
      const matchPriority = pf === 'All' || p.priority === pf;
      return matchSearch && matchStatus && matchPriority;
    });
  });

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  deletePatient(id: string, name: string) {
    if (confirm(`Are you sure you want to delete patient record for "${name}"? This cannot be undone.`)) {
      this.patientSvc.delete(id);
    }
  }

  getStatusClass(status: string): string {
    return (
      {
        Pending: 'badge-pending',
        'In Progress': 'badge-progress',
        Completed: 'badge-completed',
      }[status] ?? 'badge-pending'
    );
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  getTestsSummary(patient: Patient): string {
    return patient.tests.map((t) => t.testName).join(', ');
  }
}
