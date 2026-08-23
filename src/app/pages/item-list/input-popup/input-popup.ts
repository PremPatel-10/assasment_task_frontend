import { Component, input, output } from '@angular/core';
import { ItemReq } from '../../../Models/item';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { NotificationService } from '../../../services/notification-service';

@Component({
  selector: 'app-input-popup',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, InputTextModule, InputNumberModule, ButtonModule],
  templateUrl: './input-popup.html',
  styleUrl: './input-popup.css',
})
export class InputPopup {
  isOpen = input<boolean>(false);
  isClose = output<void>();

  itemData = output<ItemReq>();

  constructor(private notify: NotificationService) {}

  itemForm = new FormGroup({
    itemNameForm: new FormControl('', [Validators.required]),
    itemCodeForm: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  onVisibleChange(visible: boolean) {
    if (!visible) {
      this.isClose.emit();
    }
  }

  onSubmit() {
    if (this.itemForm.invalid || !this.itemForm.value.itemNameForm?.trim()) {
      this.notify.error('Please fill in both fields before submitting');
      return;
    }

    const inpData: ItemReq = {
      itemName: this.itemForm.value.itemNameForm!,
      itemCode: Number(this.itemForm.value.itemCodeForm),
    };
    this.itemData.emit(inpData);
  }
}
