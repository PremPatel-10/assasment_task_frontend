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
    orderId: new FormControl<number | null>(null, [Validators.required]),
    details: new FormArray([]),
  });

  get detailsArray() {
    return this.detailsForm.get('details') as FormArray;
  }

  id: number = 0;
  isExist: boolean = false;
  existingData = signal<Details[]>([]);
  ngOnInit() {
    this.route.paramMap.subscribe((param) => {
      this.id = Number(param.get('id'));

      this.detailsForm.patchValue({
        orderId: this.id,
      });

      this.orderDetailsService.getBulkDetailsById(this.id).subscribe({
        next: (data) => {
          this.existingData.set(data);
        },
        error: () => {
          alert('No Detials Exist for This Order');
        },
      });

      this.orderDetailsService.getBulkDetailsById(this.id).subscribe((data) => {
        this.isExist = data.length > 0;

        // if data exist
        if (this.isExist) {
          this.detailsArray.clear();

          data.forEach((item) => {
            this.detailsArray.push(
              new FormGroup({
                itemId: new FormControl(item.itemId),
                price: new FormControl(item.price),
                quantity: new FormControl(item.quantity),
                total: new FormControl(item.total),
              }),
            );
          });
        }
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
    console.log(this.detailsArray);
  }

  //------------------------------------------------------------------------------------------------------
  addRow() {
    this.detailsArray.push(
      new FormGroup({
        itemId: new FormControl<number | null>(null, Validators.required),
        price: new FormControl(0, Validators.required),
        quantity: new FormControl(0, Validators.required),
        total: new FormControl(0),
      }),
    );
  }

  //--------------------------------------------------------------------------------------------------------

  saveOrders() {
    if (this.detailsForm.valid) {
      const orderId = Number(this.detailsForm.value.orderId);

      const bulkData: DetailsReq[] = this.detailsArray.controls.map((row) => ({
        orderId: orderId,
        itemId: Number(row.get('itemId')?.value),
        price: Number(row.get('price')?.value),
        quantity: Number(row.get('quantity')?.value),
        total: Number(row.get('total')?.value),
      }));

      if (this.isExist) {
        this.orderDetailsService.putBulkDetails(orderId, bulkData).subscribe({
          next: () => {
            alert('Details Updated Successfully');
            this.router.navigate(['/orderlist']);
          },

          error: (err) => {
            console.log(err);
            alert('Failed : ' + err.error);
          },
        });
      } else {
        this.orderDetailsService.postBulkDetails(bulkData).subscribe({
          next: () => {
            alert('Details Added Successfully');
            this.router.navigate(['/orderlist']);
          },

          error: (err) => {
            console.log(err);
            alert('Failed : ' + err.error);
          },
        });
      }
    }
  }

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
