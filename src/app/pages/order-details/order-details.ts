import { Component, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    details: new FormArray([]),
  });

  get detailsArray() {
    return this.detailsForm.get('details') as FormArray;
  }

  id: number = 0;
  // Total = signal<number>(0);
  // detailId: number = 0;
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

    this.addRow();
  }

  //------------------------------------------------------------------------------------------------------
  addRow() {
    const row = new FormGroup({
      itemId: new FormControl(0, Validators.required),
      price: new FormControl(0, Validators.required),
      quantity: new FormControl(0, Validators.required),
      total: new FormControl(0),
    });

    this.detailsArray.push(row);
  }

  //--------------------------------------------------------------------------------------------------------

  saveOrders() {
    if (this.detailsForm.valid) {
      const orderId = this.detailsForm.value.orderId!;
      const bulkData: DetailsReq[] = this.detailsArray.value.map((data: DetailsReq) => ({
        orderId: orderId,
        itemId: data.itemId,
        price: data.price,
        quantity: data.quantity,
      }));
      this.orderDetailsService.postBulkDetails(bulkData).subscribe({
        next: () => {
          alert('Details Added Successfully');
          this.router.navigate(['/orderlist']);
        },
        error: (err) => {
          alert('Failed : ' + err.Messege);
        },
      });
    }
  }

  // onSubmit() {
  //   if (this.detailsForm.valid) {
  //    const payload: DetailsReq[] = (this.detailsArray.value as any[]).map((x) => ({
  //      orderId: x.orderId,
  //      itemId: x.itemId,
  //      price: x.price,
  //      quantity: x.quantity,
  //    }));

  //     if (this.detailId) {
  //       this.orderDetailsService.putDetails(this.detailId, detailsData).subscribe({
  //         next: () => {
  //           alert('Details Updated Successfully');
  //           this.router.navigate(['/orderlist']);
  //         },
  //         error: (err) => {
  //           alert('Details Updation Failed, Error: ' + err.Messege);
  //         },
  //       });
  //     } else {
  //       this.orderDetailsService.postDetails(detailsData).subscribe({
  //         next: () => {
  //           alert('Detail Added Successfully');
  //           this.router.navigate(['/orderlist']);
  //         },
  //         error: (err) => {
  //           alert('Failed to Add Details, Occurs Error: ' + err.Messege);
  //         },
  //       });
  //     }
  //   }
  // }

  calculateTotal(index: number) {
    const row = this.detailsArray.at(index);
    const price = Number(row.get('price')?.value || 0);
    const quantity = Number(row.get('quantity')?.value || 0);
    row.get('total')?.setValue(price * quantity);
  }

  goBack() {
    this.router.navigate(['/orderlist']);
  }
}
