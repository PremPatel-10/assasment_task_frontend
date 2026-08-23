import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from './services/auth-service';
import { SignalrService } from './services/signalr-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
  ],
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

  initials = computed(() => {
    const name = this.authService.username();
    return name ? name.slice(0, 2).toUpperCase() : '';
  });

  readonly navLinks = [
    { path: '/', label: 'Home', icon: 'pi pi-home' },
    { path: '/dashboard', label: 'Dashboard', icon: 'pi pi-chart-bar' },
    { path: '/itemlist', label: 'Item List', icon: 'pi pi-box' },
    { path: '/orderlist', label: 'Order List', icon: 'pi pi-shopping-cart' },
  ];

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
