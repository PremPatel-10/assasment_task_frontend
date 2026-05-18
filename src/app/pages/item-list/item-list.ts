import { Component, signal } from '@angular/core';
import { ItemService } from '../../services/item-service';
import { Item, ItemReq } from '../../services/itemType';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [],
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
    this.loadPage();
  }

  showAllList() {
    this.loadPage();
  }

  /*---------------------------------------------------------------------------------------------------*/

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
        this.pageData.update((i) => [...i, data]);
      },
      error: (err) => {
        alert('Item already Exist');
        console.log('err: ' + err.message);
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  confirmdata: boolean = false;
  onDelete(id: number) {
    this.confirmdata = confirm('Are you sure for Deleting Item');

    if (this.confirmdata.valueOf()) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          alert('Data Deleted Successfully');
          this.pageData.update((i) => i?.filter((u) => u.itemId !== id));
        },
        error: (err) => {
          alert("Data doesn't Deleted with Error: " + err.Message);
        },
      });
    } else {
      alert('Data Deletion Canceled');
      this.router.navigate(['/']);
    }
  }

  /*---------------------------------------------------------------------------------------------------*/

  onUpdate(id: number) {
    this.router.navigate(['/edit', id]);
  }

  /*---------------------------------------------------------------------------------------------------*/

  searchedItemD = signal<Item[] | undefined>(undefined);
  onSearch() {
    const searchedItem = (document.querySelector('#searchBar') as HTMLInputElement).value;

    if (!searchedItem.trim()) return;

    this.itemService.searchItem(searchedItem).subscribe({
      next: (data) => {
        this.pageData.set(data);
      },
      error: (err) => console.error(err),
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  pageData = signal<Item[]>([]);
  pageSize: number = 5;
  pageNumber: number = 1;

  loadPage() {
    this.itemService.itemPages(this.pageNumber, this.pageSize).subscribe({
      next: (data) => {
        this.pageData.set(data);
      },
      error: (err) => {
        console.log('Error: ' + err.Message);
      },
    });
  }

  nextPage() {
    this.pageNumber++;
    this.loadPage();
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadPage();
    }
  }
}
