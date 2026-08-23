import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../services/order-service';
import { Router } from '@angular/router';
import { Order } from '../../Models/Order';
import { OrderDetailsService } from '../../services/order-details-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ExportService } from '../../services/export-service';
import { SignalrService } from '../../services/signalr-service';
import { NotificationService } from '../../services/notification-service';
import { errorMessage } from '../../utils/http-error';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DecimalPipe,
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList {
  totalOrderCount: number = 0;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private orderDetailsService: OrderDetailsService,
    public authService: AuthService,
    private exportService: ExportService,
    private signalrService: SignalrService,
    private notify: NotificationService,
  ) {
    // Live refresh whenever another client adds/edits/deletes an order.
    this.signalrService.ordersChanged$.pipe(takeUntilDestroyed()).subscribe(() => this.loadPage());
  }

  /*---------------------------------------------------------------------------------------------------*/

  addOrder() {
    this.router.navigate(['orderlist/add']);
  }

  /*---------------------------------------------------------------------------------------------------*/

  onDelete(id: number) {
    this.notify.confirm('Are you sure you want to delete this order?', () => {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.notify.success('Order deleted successfully');
          this.pageData.update((o) => o?.filter((o) => o.orderId !== id));
        },
        error: (err) => {
          this.notify.error("Couldn't delete order: " + errorMessage(err));
        },
      });
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  onUpdate(id: number) {
    this.router.navigate(['orderlist/edit/order', id]);
  }

  /*---------------------------------------------------------------------------------------------------*/

  searchTerm = new FormControl('');
  onSearch() {
    const value = this.searchTerm.value?.trim();
    if (!value) return;

    this.orderService.searchOrder(value).subscribe({
      next: (data) => {
        if (data.length >= 1) {
          this.pageData.set(data);
        } else {
          this.notify.info('Order not found');
          this.loadPage();
        }
        this.searchTerm.reset('');
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Search failed due to a server error');
        this.loadPage();
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  pageData = signal<Order[]>([]);
  pageSize: number = 5;
  pageNumber: number = 1;
  loading = signal<boolean>(true);

  loadPage() {
    this.loading.set(true);
    this.orderService.itemPages(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.pageData.set(result.items);
        this.totalOrderCount = result.totalCount;
        this.loading.set(false);
      },
      error: (err) => {
        console.log('Error: ' + errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const rows = event.rows ?? this.pageSize;
    this.pageSize = rows;
    this.pageNumber = Math.floor((event.first ?? 0) / rows) + 1;
    this.loadPage();
  }

  /*---------------------------------------------------------------------------------------------------*/

  goToDetails(id: number) {
    this.orderDetailsService.getDetailsByOId(id).subscribe({
      next: () => {
        this.router.navigate(['orderlist/orderdetails/edit-details', id]);
      },
      error: () => {
        this.router.navigate(['orderlist/orderdetails/add-details', id]);
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  private readonly exportColumns = [
    { header: 'Order Id', key: 'orderId' },
    { header: 'Order Number', key: 'orderNumber' },
    { header: 'Vendor Name', key: 'vendorName' },
    { header: 'Order Date', key: 'orderDate' },
    { header: 'Order Total', key: 'orderTotal' },
  ];

  exportCsv() {
    this.exportService.exportToCsv('orders', this.exportColumns, this.pageData());
  }

  exportPdf() {
    this.exportService.exportToPdf('orders', 'Order Report', this.exportColumns, this.pageData());
  }

  /*---------------------------------------------------------------------------------------------------*/
  // Per-order detail reports (order + line items), generated server-side.

  downloadOrderExcel(id: number) {
    this.orderService.exportOrderExcel(id).subscribe({
      next: (blob) => this.exportService.downloadBlob(blob, `order-${id}.xlsx`),
      error: (err) => this.notify.error('Export failed: ' + errorMessage(err)),
    });
  }

  downloadOrderPdf(id: number) {
    this.orderService.exportOrderPdf(id).subscribe({
      next: (blob) => this.exportService.downloadBlob(blob, `order-${id}.pdf`),
      error: (err) => this.notify.error('Export failed: ' + errorMessage(err)),
    });
  }
}
