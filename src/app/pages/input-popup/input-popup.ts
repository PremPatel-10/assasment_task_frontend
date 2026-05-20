import { Component, input, output } from '@angular/core';
import { ItemReq } from '../../services/itemType';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-input-popup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-popup.html',
  styleUrl: './input-popup.css',
})
export class InputPopup {
  isOpen = input<boolean>(false);
  isClose = output<void>();

  itemData = output<ItemReq>();

  itemForm: FormGroup = new FormGroup({
    itemNameForm: new FormControl('', [Validators.required]),
    itemCodeForm: new FormControl(0, [Validators.required]),
  });

  onSubmit() {
    let inpData: ItemReq | undefined = undefined;

    const inpItemName = this.itemForm.value.itemNameForm;
    const inpItemCode = Number(this.itemForm.value.itemCodeForm);

    if (this.itemForm.valid) {
      inpData = {
        itemName: inpItemName,
        itemCode: inpItemCode,
      };
      console.log(inpData);
      this.itemData.emit(inpData);
    } else {
      alert('Do not keep your fields empty');
    }
  }
}
