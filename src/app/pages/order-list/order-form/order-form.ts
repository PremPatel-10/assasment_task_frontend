import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order-service';
import { OrderReq } from '../../../Models/Order';
import { errorMessage } from '../../../utils/http-error';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../../../services/notification-service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css',
})
export class OrderForm {
  orderForm = new FormGroup({
    orderNumber: new FormControl(0, [Validators.required]),
    vendorName: new FormControl('', [Validators.required]),
    orderDate: new FormControl('', [Validators.required]),
  });

  // Read-only, server-computed — the sum of this order's line-item totals. Not part of the form
  // group so it's never sent back to the API; OrderTotal has no input on create/update anymore.
  computedOrderTotal: number | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private notify: NotificationService,
  ) {}

  id: number = 0;
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.id = Number(params.get('id'));

      if (this.id) {
        this.orderService.getOrderById(this.id).subscribe({
          next: (data) => {
            this.orderForm.patchValue(data);
            this.computedOrderTotal = data.orderTotal;
          },
          error: (err) => {
            this.notify.error(errorMessage(err));
          },
        });
      }
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      const orderUpdateData: OrderReq = {
        orderNumber: this.orderForm.value.orderNumber!,
        vendorName: this.orderForm.value.vendorName!,
        orderDate: this.orderForm.value.orderDate!,
      };

      if (this.id) {
        this.orderService.updateOrder(this.id, orderUpdateData).subscribe({
          next: () => {
            this.notify.success('Order updated successfully');
            this.router.navigate(['/orderlist']);
          },
          error: (err) => {
            this.notify.error(errorMessage(err));
          },
        });
      } else {
        this.orderService.insertOrder(orderUpdateData).subscribe({
          next: () => {
            this.notify.success('Order added successfully');
            this.router.navigate(['/orderlist']);
          },
          error: (err) => {
            this.notify.error(errorMessage(err));
          },
        });
      }
    } else {
      this.notify.error('Please provide all required information');
    }
  }

  backToHomepage() {
    this.router.navigate(['/orderlist']);
  }
}
