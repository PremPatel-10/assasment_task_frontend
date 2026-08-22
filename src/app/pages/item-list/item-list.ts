import { Component, signal } from '@angular/core';
import { ItemService } from '../../services/item-service';
import { Item, ItemReq } from '../../Models/item';
import { Router } from '@angular/router';
import { InputPopup } from './input-popup/input-popup';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [InputPopup, ReactiveFormsModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  totalItemCount: number = 0;

  constructor(
    private itemService: ItemService,
    private router: Router,
  ) {}

  ngOnInit() {
    //total record for page count
    this.itemService.getAllItem().subscribe((data) => {
      this.totalItemCount = data.length;
      console.log('Total Item:', this.totalItemCount);
    });

    this.loadPage();
  }

  /*---------------------------------------------------------------------------------------------------*/

  isPopupOpen = signal<boolean>(false);
  onInsert(inpData: ItemReq) {
    if (inpData) {
      this.itemService.insertItem(inpData).subscribe({
        next: (data) => {
          alert('Item Added Successfully');
          this.pageData.update((i) => [...i, data]);
        },
        error: (err) => {
          alert('Error: ' + err.message);
          console.log('err: ' + err.message);
        },
      });
    }
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
          alert("Data doesn't Deleted with Error: " + err.message);
        },
      });
    } else {
      alert('Data Deletion Canceled');
      this.router.navigate(['/']);
    }
  }

  /*---------------------------------------------------------------------------------------------------*/

  onUpdate(id: number) {
    this.router.navigate(['itemlist/edit/item', id]);
  }

  /*---------------------------------------------------------------------------------------------------*/

  searchedItemD = signal<Item[] | undefined>(undefined);
  searchTerm = new FormControl('');
  onSearch() {
    const value = this.searchTerm.value?.trim();
    if (!value) return;

    this.itemService.searchItem(value).subscribe({
      next: (data) => {
        if (data.length >= 1) {
          this.pageData.set(data);
        } else {
          alert('Item not Found');
          this.loadPage();
        }
        this.searchTerm.reset('');
      },
      error: (err) => {
        console.error(err);
        alert('Search failed due to a server error');
        this.loadPage();
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  pageData = signal<Item[]>([]);
  pageSize: number = 5;
  pageNumber: number = 1;
  finalPage: number = 0;

  loadPage() {
    this.itemService.itemPages(this.pageNumber, this.pageSize).subscribe({
      next: (data) => {
        this.pageData.set(data);
        this.finalPage = Math.ceil(this.totalItemCount / this.pageSize);
      },
      error: (err) => {
        console.log('Error: ' + err.message);
      },
    });
  }

  nextPage() {
    if (this.pageNumber < this.finalPage) {
      this.pageNumber++;
      this.loadPage();
    }
  }

  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadPage();
    }
  }
}
