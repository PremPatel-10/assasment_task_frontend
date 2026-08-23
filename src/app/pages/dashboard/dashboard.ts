import { AfterViewInit, Component, ElementRef, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, merge } from 'rxjs';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { ItemService } from '../../services/item-service';
import { OrderService } from '../../services/order-service';
import { Item } from '../../Models/item';
import { Order } from '../../Models/Order';
import { SignalrService } from '../../services/signalr-service';
import { errorMessage } from '../../utils/http-error';
import { NotificationService } from '../../services/notification-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements AfterViewInit {
  @ViewChild('vendorCanvas') vendorCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendCanvas') trendCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('itemStatusCanvas') itemStatusCanvas!: ElementRef<HTMLCanvasElement>;

  // Signals, not plain properties — this app runs zoneless (no zone.js), so a plain property set
  // inside an RxJS subscribe() callback never triggers a re-render. Only a signal write does.
  // (The charts next to these don't have this problem: Chart.js draws straight to the canvas,
  // bypassing Angular's template/change-detection system entirely.)
  totalItems = signal(0);
  activeItems = signal(0);
  totalOrders = signal(0);
  totalOrderValue = signal(0);

  private vendorChart?: Chart;
  private trendChart?: Chart;
  private itemStatusChart?: Chart;

  private viewReady = false;

  constructor(
    private itemService: ItemService,
    private orderService: OrderService,
    private signalrService: SignalrService,
    private notify: NotificationService,
  ) {
    // Live refresh whenever another client changes items or orders. takeUntilDestroyed() needs
    // an injection context, so this has to be wired up here rather than in ngAfterViewInit().
    merge(this.signalrService.itemsChanged$, this.signalrService.ordersChanged$)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadAndRender());
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.loadAndRender();
  }

  private loadAndRender() {
    if (!this.viewReady) return;

    forkJoin({
      items: this.itemService.getAllItem(),
      orders: this.orderService.getAllOrder(),
    }).subscribe({
      next: ({ items, orders }) => this.render(items, orders),
      error: (err) => this.notify.error('Failed to load dashboard data: ' + errorMessage(err)),
    });
  }

  private render(items: Item[], orders: Order[]) {
    this.totalItems.set(items.length);
    this.activeItems.set(items.filter((i) => i.isActive).length);
    this.totalOrders.set(orders.length);
    this.totalOrderValue.set(orders.reduce((sum, o) => sum + (o.orderTotal || 0), 0));

    this.renderVendorChart(orders);
    this.renderTrendChart(orders);
    this.renderItemStatusChart(items);
  }

  /*---------------------------------------------------------------------------------------------------*/

  private renderVendorChart(orders: Order[]) {
    const totalsByVendor = new Map<string, number>();
    for (const o of orders) {
      totalsByVendor.set(
        o.vendorName,
        (totalsByVendor.get(o.vendorName) || 0) + (o.orderTotal || 0),
      );
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
            backgroundColor: '#14213d',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
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
            borderColor: '#fca311',
            backgroundColor: 'rgba(252, 163, 17, 0.15)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
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
            backgroundColor: ['#fca311', '#d1d5db'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    };

    this.itemStatusChart?.destroy();
    this.itemStatusChart = new Chart(this.itemStatusCanvas.nativeElement, config);
  }
}
