import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  error = signal('');
  currentYear = new Date().getFullYear();

  private auth: AuthService = inject(AuthService);
  private router: Router = inject(Router);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  async onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      this.error.set('Please enter both username and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      const success = await this.auth.login(this.username.trim(), this.password.trim());
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('Invalid username or password. Please try again.');
      }
    } catch {
      this.error.set('An error occurred. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }
}
