import { Component, signal } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { Router } from '@angular/router';
import { Order, OrderReq } from '../../Models/Order';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderList {
  constructor(
    private orderService: OrderService,
    private router: Router,
  ) {}

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

  loadPage() {
    this.orderService.itemPages(this.pageNumber, this.pageSize).subscribe({
      next: (data) => {
        this.pageData.set(data);
      },
      error: (err) => {
        console.log('Error: ' + err.Message);
      },
    });
  }

  nextPage() {
    this.pageNumber++;
    this.loadPage();
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadPage();
    }
  }
}
