import { Component, input, output } from '@angular/core';
import { ItemReq } from '../../services/itemType';

@Component({
  selector: 'app-input-popup',
  standalone: true,
  imports: [],
  templateUrl: './input-popup.html',
  styleUrl: './input-popup.css',
})
export class InputPopup {
  isOpen = input<boolean>(false);
  isClose = output<void>();

  itemData = output<ItemReq>();
  onSubmit() {
    let inpData: ItemReq = { itemName: '', itemCode: 0 };

    const inpItemName = (document.querySelector('#inpItemName') as HTMLInputElement).value;
    const inpItemCode = Number((document.querySelector('#inpItemCode') as HTMLInputElement).value);
    inpData = {
      itemName: inpItemName,
      itemCode: inpItemCode,
    };

    this.itemData.emit(inpData);
  }
}
