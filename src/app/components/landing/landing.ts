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

  readonly imageGallery = [
    {
      title: 'Landing experience',
      section: 'Hero & navigation',
      description:
        'The public-facing landing view introduces the lab brand, value proposition, and staff access entry points.',
      image: '/Screenshot%20from%202026-08-06%2000-44-22.png',
    },
    {
      title: 'Clinical departments',
      section: 'Diagnostic departments',
      description:
        'This screen highlights core laboratory specialties such as hematology, chemistry, and serology services.',
      image: '/Screenshot%20from%202026-08-06%2000-45-08.png',
    },
    {
      title: 'Test catalog',
      section: 'Test directory',
      description:
        'The test catalog presents available panels with specimen requirements, turnaround time, and reference details.',
      image: '/Screenshot%20from%202026-08-06%2000-45-27.png',
    },
    {
      title: 'Clinical standards',
      section: 'Quality assurance',
      description:
        'This view reinforces the laboratory’s quality standards, automated flagging rules, and reporting precision.',
      image: '/Screenshot%20from%202026-08-06%2000-45-49.png',
    },
    {
      title: 'Dashboard overview',
      section: 'Operations dashboard',
      description:
        'The dashboard summarizes patient counts, urgent cases, completed records, and recent diagnostic activity.',
      image: '/Screenshot%20from%202026-08-06%2000-47-20.png',
    },
    {
      title: 'Patient intake form',
      section: 'Patient registration',
      description:
        'The patient form captures personal details, clinical context, tests requested, and doctor information.',
      image: '/Screenshot%20from%202026-08-06%2000-47-53.png',
    },
    {
      title: 'Patient record list',
      section: 'Patient management',
      description:
        'The records page provides a structured list of registered patients and their current laboratory status.',
      image: '/Screenshot%20from%202026-08-06%2000-48-23.png',
    },
    {
      title: 'Test result entry',
      section: 'Result review',
      description:
        'This screen supports entering parameter values, reviewing normal ranges, and flagging abnormal findings.',
      image: '/Screenshot%20from%202026-08-06%2000-48-45.png',
    },
    {
      title: 'Lab report preview',
      section: 'Reporting module',
      description:
        'The report view prepares a doctor-ready summary that can be printed or shared after completion.',
      image: '/Screenshot%20from%202026-08-06%2000-49-22.png',
    },
    {
      title: 'Secure staff access',
      section: 'Login portal',
      description:
        'The login screen provides controlled access to the staff dashboard, patient workflows, and report tools.',
      image: '/Screenshot%20from%202026-08-06%2000-50-02.png',
    },
    {
      title: 'Navigation system',
      section: 'Shared layout',
      description:
        'The shared navigation keeps the experience consistent across the landing, dashboard, and patient modules.',
      image: '/Screenshot%20from%202026-08-06%2000-50-32.png',
    },
    {
      title: 'Lab workflow review',
      section: 'Operational workflow',
      description:
        'This illustration captures the broader diagnostic workflow from intake through analysis and reporting.',
      image: '/Screenshot%20from%202026-08-06%2000-51-35.png',
    },
    {
      title: 'Clinical reporting suite',
      section: 'End-to-end experience',
      description:
        'This screen ties together the public lab experience and the staff-facing reporting tools in one view.',
      image: '/Screenshot%20from%202026-08-06%2000-51-35.png',
    },
  ];

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
