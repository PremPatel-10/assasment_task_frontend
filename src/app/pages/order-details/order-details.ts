import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderDetailsService } from '../../services/order-details-service';
import { ActivatedRoute } from '@angular/router';
import { Details, DetailsReq } from '../../Models/Details';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails {
  allDetails = signal<Details | undefined>(undefined);

  constructor(
    private orderDetailsService: OrderDetailsService,
    private route: ActivatedRoute,
  ) {}

  detailsForm = new FormGroup({
    orderId: new FormControl(0, [Validators.required]),
    itemId: new FormControl(0, [Validators.required]),
    price: new FormControl(0, [Validators.required]),
    quantity: new FormControl(0, [Validators.required]),
  });

  id: number | undefined;
  Total = signal<Number>(0);
  ngOnInit() {
    console.log(this.allDetails()?.orderId);

    this.route.paramMap.subscribe((param) => {
      this.id = Number(param.get('id'));
    });
  }
}
