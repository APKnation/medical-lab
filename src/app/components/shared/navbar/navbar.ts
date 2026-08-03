import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class NavbarComponent {
  private readonly auth: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  readonly staff = this.auth.currentStaff;
  readonly isAdmin = this.auth.isAdmin;

  navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'Patients', route: '/patients', icon: 'users' },
    { label: 'Add Patient', route: '/patients/new', icon: 'plus-circle' },
  ];

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
