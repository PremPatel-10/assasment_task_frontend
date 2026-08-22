import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { ItemService } from '../../services/item-service';
import { OrderService } from '../../services/order-service';
import { Item } from '../../Models/item';
import { Order } from '../../Models/Order';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  @ViewChild('vendorCanvas') vendorCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('itemStatusCanvas') itemStatusCanvas!: ElementRef<HTMLCanvasElement>;

  totalItems = 0;
  activeItems = 0;
  totalOrders = 0;
  totalOrderValue = 0;

  private vendorChart?: Chart;
  private trendChart?: Chart;
  private itemStatusChart?: Chart;

  constructor(
    private itemService: ItemService,
    private orderService: OrderService,
  ) {}

  ngAfterViewInit() {
    forkJoin({
      items: this.itemService.getAllItem(),
      orders: this.orderService.getAllOrder(),
    }).subscribe({
      next: ({ items, orders }) => this.render(items, orders),
      error: (err) => console.log('Error loading dashboard: ' + err.message),
    });
  }

  private render(items: Item[], orders: Order[]) {
    this.totalItems = items.length;
    this.activeItems = items.filter((i) => i.isActive).length;
    this.totalOrders = orders.length;
    this.totalOrderValue = orders.reduce((sum, o) => sum + (o.orderTotal || 0), 0);

    this.renderVendorChart(orders);
    this.renderTrendChart(orders);
    this.renderItemStatusChart(items);
  }

  /*---------------------------------------------------------------------------------------------------*/

  private renderVendorChart(orders: Order[]) {
    const totalsByVendor = new Map<string, number>();
    for (const o of orders) {
      totalsByVendor.set(o.vendorName, (totalsByVendor.get(o.vendorName) || 0) + (o.orderTotal || 0));
    }

    const topVendors = [...totalsByVendor.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: topVendors.map(([vendor]) => vendor),
        datasets: [
          {
            label: 'Order Total',
            data: topVendors.map(([, total]) => total),
            backgroundColor: '#0d6efd',
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    };

    this.vendorChart?.destroy();
    this.vendorChart = new Chart(this.vendorCanvas.nativeElement, config);
  }

  /*---------------------------------------------------------------------------------------------------*/

  private renderTrendChart(orders: Order[]) {
    const totalsByDate = new Map<string, number>();
    for (const o of orders) {
      if (!o.orderDate) continue;
      totalsByDate.set(o.orderDate, (totalsByDate.get(o.orderDate) || 0) + (o.orderTotal || 0));
    }

    const sortedDates = [...totalsByDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: sortedDates.map(([date]) => date),
        datasets: [
          {
            label: 'Order Total',
            data: sortedDates.map(([, total]) => total),
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.15)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true, plugins: { legend: { display: false } } },
    };

    this.trendChart?.destroy();
    this.trendChart = new Chart(this.trendCanvas.nativeElement, config);
  }

  /*---------------------------------------------------------------------------------------------------*/

  private renderItemStatusChart(items: Item[]) {
    const active = items.filter((i) => i.isActive).length;
    const inactive = items.length - active;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Inactive'],
        datasets: [
          {
            data: [active, inactive],
            backgroundColor: ['#0d6efd', '#adb5bd'],
          },
        ],
      },
      options: { responsive: true },
    };

    this.itemStatusChart?.destroy();
    this.itemStatusChart = new Chart(this.itemStatusCanvas.nativeElement, config);
  }
}
