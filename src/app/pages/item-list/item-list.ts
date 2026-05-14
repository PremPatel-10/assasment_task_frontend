import { Component, signal } from '@angular/core';
import { ItemService } from '../../services/item-service';
import { Item, ItemReq } from '../../services/itemType';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [ButtonModule, DialogModule, InputTextModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  allItems = signal<Item[]>([]);

  constructor(
    private itemService: ItemService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.itemService.getAllItem().subscribe({
      next: (data) => {
        this.allItems.set(data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  itemData: ItemReq | undefined;
  onInsert() {
    const inpItemName = (document.querySelector('#inpItemName') as HTMLInputElement).value;
    const inpItemCode = Number((document.querySelector('#inpItemCode') as HTMLInputElement).value);
    this.itemData = {
      itemName: inpItemName,
      itemCode: inpItemCode,
    };

    this.itemService.insertItem(this.itemData).subscribe({
      next: (data) => {
        alert('Item Added Successfully');
        this.allItems.update((i) => [...i, data]);
      },
      error: (err) => {
        console.log('err' + err);
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  confirmdata: boolean = false;
  onDelete(id: number) {
    this.confirmdata = confirm('Are you sure for Delete Item');

    if (this.confirmdata.valueOf()) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          alert('Data Deleted Successfully');
          this.allItems.update((i) => i?.filter((u) => u.itemId !== id));
        },
        error: (err) => {
          alert("Data doesn't Deleted with Error: " + err.Message);
        },
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  onUpdate(id: number) {
    this.router.navigate(['/edit', id]);
  }

  // searchedItemD = signal<Item[] | undefined>(undefined);
  // onSearch() {
  //   const searchedItem = (document.querySelector('#searchBar') as HTMLInputElement).value;
  //   // console.log(searchedItem);

  //   if (!searchedItem.trim()) return;
  //   this.itemService.searchItem(searchedItem).subscribe({
  //     next: (data) => {
  //       this.searchedItemD.set(data);
  //     },
  //     error: (err) => console.error(err),
  //   });

  //   console.log(this.searchedItemD());
  // }
}
