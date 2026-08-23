import { Component, computed, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderDetailsService } from '../../services/order-details-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Details, DetailsReq } from '../../Models/Details';
import { Order } from '../../Models/Order';
import { Item } from '../../Models/item';
import { OrderService } from '../../services/order-service';
import { ItemService } from '../../services/item-service';
import { errorMessage } from '../../utils/http-error';
import { NotificationService } from '../../services/notification-service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [ReactiveFormsModule, TableModule, ButtonModule, InputNumberModule, SelectModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  allDetails = signal<Details | undefined>(undefined);
  allOrders = signal<Order[]>([]);
  allItems = signal<Item[]>([]);

  itemOptions = computed(() =>
    this.allItems().map((item) => ({
      label: `${item.itemId} - ${item.itemName}`,
      value: item.itemId,
    })),
  );

  itemName(itemId: number): string {
    return this.allItems().find((i) => i.itemId === itemId)?.itemName ?? `Item #${itemId}`;
  }

  constructor(
    private orderDetailsService: OrderDetailsService,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private itemService: ItemService,
    private router: Router,
    private notify: NotificationService,
  ) {}

  detailsForm = new FormGroup({
    orderId: new FormControl<number | null>(null, [Validators.required]),
    details: new FormArray([]),
  });

  get detailsArray() {
    return this.detailsForm.get('details') as FormArray;
  }

  // Signals, not plain properties — this app is zoneless, so plain properties set inside the
  // subscribe() callbacks below would never trigger the template (page heading, section title)
  // to actually update. See the same fix in dashboard.ts.
  id = signal(0);
  isExist = signal(false);
  existingData = signal<Details[]>([]);
  ngOnInit() {
    this.route.paramMap.subscribe((param) => {
      const id = Number(param.get('id'));
      this.id.set(id);

      this.detailsForm.patchValue({
        orderId: id,
      });

      this.orderDetailsService.getBulkDetailsById(id).subscribe({
        next: (data) => {
          this.existingData.set(data);
        },
        error: () => {
          // No existing line items yet — this is the normal "adding details for the first time"
          // case, not a failure, so no toast here.
        },
      });

      this.orderDetailsService.getBulkDetailsById(id).subscribe((data) => {
        this.isExist.set(data.length > 0);

        // if data exist
        if (this.isExist()) {
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

  removeRow(index: number) {
    this.detailsArray.removeAt(index);
  }

  //--------------------------------------------------------------------------------------------------------

  saveOrders() {
    if (this.detailsForm.valid) {
      const orderId = Number(this.detailsForm.value.orderId);

      // total is computed server-side from price * quantity — not sent to the API.
      const bulkData: DetailsReq[] = this.detailsArray.controls.map((row) => ({
        orderId: orderId,
        itemId: Number(row.get('itemId')?.value),
        price: Number(row.get('price')?.value),
        quantity: Number(row.get('quantity')?.value),
      }));

      if (this.isExist()) {
        this.orderDetailsService.putBulkDetails(orderId, bulkData).subscribe({
          next: () => {
            this.notify.success('Details updated successfully');
            this.router.navigate(['/orderlist']);
          },

          error: (err) => {
            this.notify.error(errorMessage(err));
          },
        });
      } else {
        this.orderDetailsService.postBulkDetails(bulkData).subscribe({
          next: () => {
            this.notify.success('Details added successfully');
            this.router.navigate(['/orderlist']);
          },

          error: (err) => {
            this.notify.error(errorMessage(err));
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
