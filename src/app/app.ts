import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private auth: AuthService = inject(AuthService);
  readonly showSidebar = this.auth.isAuthenticated;

  async ngOnInit(): Promise<void> {
    // Auth state is already loaded from storage in constructor
  }
}
