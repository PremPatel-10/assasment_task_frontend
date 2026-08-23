import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, CardModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  constructor(public authService: AuthService) {}

  readonly shortcuts = [
    {
      path: '/dashboard',
      icon: 'pi pi-chart-bar',
      title: 'Dashboard',
      description: 'Stock levels, order totals, and trends at a glance.',
    },
    {
      path: '/itemlist',
      icon: 'pi pi-box',
      title: 'Item List',
      description: 'Browse, search, and manage inventory items.',
    },
    {
      path: '/orderlist',
      icon: 'pi pi-shopping-cart',
      title: 'Order List',
      description: 'Track purchase orders and their line items.',
    },
  ];
}
