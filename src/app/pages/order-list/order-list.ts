import { Component, signal } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { Router } from '@angular/router';
import { Order } from '../../Models/Order';
import { OrderDetailsService } from '../../services/order-details-service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList {
  totalOrderCount: number = 0;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private orderDetailsService: OrderDetailsService,
  ) {}

  ngOnInit() {
    //total record for page count
    this.orderService.getAllOrder().subscribe((data) => {
      this.totalOrderCount = data.length;
      console.log('Total Order:', this.totalOrderCount);
    });

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
          alert("Data doesn't Deleted with Error: " + err.Message);
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
  onSearch() {
    let searchedOrder = document.querySelector('#searchBar') as HTMLInputElement;

    if (!searchedOrder.value.trim()) return;

    this.orderService.searchOrder(searchedOrder.value).subscribe({
      next: (data) => {
        if (data.length >= 1) {
          this.pageData.set(data);
        } else {
          alert('Order Record not Found');
          this.loadPage();
        }
        searchedOrder.value = '';
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
      next: (data) => {
        this.pageData.set(data);
        this.finalPage = Math.ceil(this.totalOrderCount / this.pageSize);
      },
      error: (err) => {
        console.log('Error: ' + err.Message);
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
}
