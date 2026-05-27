import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderDetailsService } from '../../services/order-details-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Details, DetailsReq } from '../../Models/Details';
import { Order } from '../../Models/Order';
import { Item } from '../../Models/item';
import { OrderService } from '../../services/order-service';
import { ItemService } from '../../services/item-service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  allDetails = signal<Details | undefined>(undefined);
  allOrders = signal<Order[]>([]);
  allItems = signal<Item[]>([]);

  constructor(
    private orderDetailsService: OrderDetailsService,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private itemService: ItemService,
    private router: Router,
  ) {}

  detailsForm = new FormGroup({
    orderId: new FormControl(0, [Validators.required]),
    itemId: new FormControl(0, [Validators.required]),
    price: new FormControl(0, [Validators.required]),
    quantity: new FormControl(0, [Validators.required]),
  });

  id: number = 1;
  Total = signal<number>(0);
  ngOnInit() {
    this.route.paramMap.subscribe((param) => {
      this.id = Number(param.get('id'));

      this.detailsForm.patchValue({
        orderId: this.id,
      });
    });

    this.orderService.getAllOrder().subscribe({
      next: (data) => {
        this.allOrders.set(data);
      },
    });

    this.itemService.getAllItem().subscribe({
      next: (data) => {
        this.allItems.set(data);
      },
    });
  }

  onSubmit() {
    if (this.detailsForm.valid) {
      const detailsData: DetailsReq = {
        orderId: this.detailsForm.value.orderId!,
        itemId: this.detailsForm.value.itemId!,
        price: this.detailsForm.value.price!,
        quantity: this.detailsForm.value.quantity!,
        total: this.Total(),
      };

      this.orderDetailsService.postDetails(detailsData).subscribe({
        next: () => {
          alert('Details Added');
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  calculateTotal() {
    const price = this.detailsForm.value.price || 0;
    const quantity = this.detailsForm.value.quantity || 0;

    this.Total.set(price * quantity);
  }

  goBack() {
    this.router.navigate(['/orderlist']);
  }
}
