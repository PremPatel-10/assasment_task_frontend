import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service';
import { SignalrService } from './services/signalr-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(
    public authService: AuthService,
    private router: Router,
    // Injected here (unused otherwise) purely to force SignalrService's construction at app
    // startup instead of lazily on first use — it needs to connect as soon as login happens.
    private signalrService: SignalrService,
  ) {}

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
