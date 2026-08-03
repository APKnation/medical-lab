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

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      this.error.set('Please enter both username and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    setTimeout(() => {
      const success = this.auth.login(this.username.trim(), this.password.trim());
      this.loading.set(false);
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('Invalid username or password. Please try again.');
      }
    }, 800);
  }
}
