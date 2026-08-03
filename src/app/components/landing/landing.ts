import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LabTestService } from '../../services/lab-test.service';
import { AuthService } from '../../services/auth.service';
import { LabTest } from '../../models/lab-test.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './landing.html',
})
export class LandingComponent {
  private labTestSvc: LabTestService = inject(LabTestService);
  private auth: AuthService = inject(AuthService);

  readonly isLoggedIn = this.auth.isAuthenticated;

  searchQuery = signal('');
  selectedCategory = signal('All');
  selectedTestModal = signal<LabTest | null>(null);

  categories = [
    'All',
    'Hematology',
    'Clinical Chemistry',
    'Serology',
    'Endocrinology',
    'Urinalysis',
    'Parasitology',
  ];

  allTests = this.labTestSvc.getAll();

  get filteredTests(): LabTest[] {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.allTests.filter((t) => {
      const matchCat = cat === 'All' || t.category === cat;
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.description ? t.description.toLowerCase().includes(q) : false);
      return matchCat && matchQuery;
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  openTestModal(test: LabTest): void {
    this.selectedTestModal.set(test);
  }

  closeModal(): void {
    this.selectedTestModal.set(null);
  }

  activeFaq = signal<number | null>(0);

  toggleFaq(index: number): void {
    this.activeFaq.update((val) => (val === index ? null : index));
  }

  faqs = [
    {
      q: 'How fast can I receive my laboratory test results?',
      a: 'Routine tests (e.g. Complete Blood Count, Blood Glucose, Urinalysis) are ready within 1 to 2 hours. Specialized chemistry panel results are delivered within 4 hours. Emergency priority tests are processed immediately.',
    },
    {
      q: 'Do I need a doctor referral to take tests at LifeCare?',
      a: 'We accept both walk-in patients requesting health screening packages and direct physician referrals. Reports include standardized reference ranges and doctor-ready clinical summaries.',
    },
    {
      q: 'Are LifeCare laboratory reports officially recognized?',
      a: 'Yes. LifeCare Medical Laboratory is licensed under KMPDC (Lic. KE/LAB/2025/001) and accredited under ISO 15189 standards. Our reports are accepted by all major hospitals, clinics, and insurance providers.',
    },
    {
      q: 'How are normal reference ranges determined?',
      a: 'Reference ranges are calibrated according to global clinical diagnostics standards and adjusted for biological factors such as age and gender.',
    },
    {
      q: 'Can staff access and manage patient diagnostic records online?',
      a: 'Authorized medical and lab staff can log into the Staff Portal to register patients, enter parameter test values with automated flag calculation, and generate official printable laboratory reports.',
    },
  ];
}
