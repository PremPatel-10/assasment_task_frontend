import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderService } from '../../services/order-service';
import { Router } from '@angular/router';
import { Order } from '../../Models/Order';
import { OrderDetailsService } from '../../services/order-details-service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ExportService } from '../../services/export-service';
import { SignalrService } from '../../services/signalr-service';
import { errorMessage } from '../../utils/http-error';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [ReactiveFormsModule],
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
  ) {
    // Live refresh whenever another client adds/edits/deletes an order.
    this.signalrService.ordersChanged$.pipe(takeUntilDestroyed()).subscribe(() => this.loadPage());
  }

  ngOnInit() {
    this.loadPage();
  }

  /*---------------------------------------------------------------------------------------------------*/

  addOrder() {
    this.router.navigate(['orderlist/add']);
  }

  /*---------------------------------------------------------------------------------------------------*/

  confirmdata: boolean = false;
  onDelete(id: number) {
    this.confirmdata = confirm('Are you sure for Deleting Order');

    if (this.confirmdata.valueOf()) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          alert('Data Deleted Successfully');
          this.pageData.update((o) => o?.filter((o) => o.orderId !== id));
        },
        error: (err) => {
          alert("Data doesn't Deleted with Error: " + errorMessage(err));
        },
      });
    } else {
      alert('Data Deletion Canceled');
      this.router.navigate(['/orderlist']);
    }
  }

  /*---------------------------------------------------------------------------------------------------*/

  onUpdate(id: number) {
    this.router.navigate(['orderlist/edit/order', id]);
  }

  /*---------------------------------------------------------------------------------------------------*/

  searchedOrderD = signal<Order[] | undefined>(undefined);
  searchTerm = new FormControl('');
  onSearch() {
    const value = this.searchTerm.value?.trim();
    if (!value) return;

    this.orderService.searchOrder(value).subscribe({
      next: (data) => {
        if (data.length >= 1) {
          this.pageData.set(data);
        } else {
          alert('Order Record not Found');
          this.loadPage();
        }
        this.searchTerm.reset('');
      },
      error: (err) => {
        console.error(err);
        alert('Search failed due to a server error');
        this.loadPage();
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  pageData = signal<Order[]>([]);
  pageSize: number = 5;
  pageNumber: number = 1;
  finalPage: number = 0;

  loadPage() {
    this.orderService.itemPages(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.pageData.set(result.items);
        this.totalOrderCount = result.totalCount;
        this.finalPage = Math.max(1, Math.ceil(result.totalCount / this.pageSize));
      },
      error: (err) => {
        console.log('Error: ' + errorMessage(err));
      },
    });
  }

  nextPage() {
    if (this.pageNumber < this.finalPage) {
      this.pageNumber++;
      this.loadPage();
    }
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadPage();
    }
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
      error: (err) => alert('Export failed: ' + errorMessage(err)),
    });
  }

  downloadOrderPdf(id: number) {
    this.orderService.exportOrderPdf(id).subscribe({
      next: (blob) => this.exportService.downloadBlob(blob, `order-${id}.pdf`),
      error: (err) => alert('Export failed: ' + errorMessage(err)),
    });
  }
}
