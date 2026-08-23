import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../../services/item-service';
import { ItemReq } from '../../../Models/item';
import { errorMessage } from '../../../utils/http-error';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../../../services/notification-service';

@Component({
  selector: 'app-update-page',
  standalone: true,
  imports: [ReactiveFormsModule, CardModule, InputTextModule, InputNumberModule, ButtonModule],
  templateUrl: './update-page.html',
  styleUrl: './update-page.css',
})
export class UpdatePage {
  itemForm = new FormGroup({
    itemName: new FormControl('', [Validators.required]),
    itemCode: new FormControl<number | null>(null, [Validators.required]),
  });

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
    private notify: NotificationService,
  ) {}

  // Not currently read in the template, so this wasn't a live rendering bug — but every other
  // route-param id in this app is a signal for the same reason (this app is zoneless; see
  // dashboard.ts), so this is fixed proactively rather than left as a landmine for whoever adds
  // an {{ id }} to this template next.
  id = signal(0);
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.id.set(id);

      if (id) {
        this.itemService.getItemById(id).subscribe({
          next: (data) => {
            this.itemForm.patchValue(data);
          },
          error: (err) => {
            this.notify.error(errorMessage(err));
          },
        });
      }
    });
  }

  onUpdate() {
    if (this.itemForm.valid) {
      const itemUpdateData: ItemReq = {
        itemName: this.itemForm.value.itemName!,
        itemCode: Number(this.itemForm.value.itemCode),
      };

      this.itemService.updateItem(this.id(), itemUpdateData).subscribe({
        next: () => {
          this.notify.success('Item updated successfully');
          this.router.navigate(['/itemlist']);
        },
        error: (err) => {
          this.notify.error(errorMessage(err));
        },
      });
    } else {
      this.notify.error('Please fill in all fields before submitting');
    }
  }

  backToHomepage() {
    this.router.navigate(['/itemlist']);
  }
}
