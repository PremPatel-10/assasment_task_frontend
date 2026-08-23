import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ItemService } from '../../services/item-service';
import { Item, ItemReq } from '../../Models/item';
import { Router } from '@angular/router';
import { InputPopup } from './input-popup/input-popup';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { ExportService } from '../../services/export-service';
import { SignalrService } from '../../services/signalr-service';
import { NotificationService } from '../../services/notification-service';
import { errorMessage } from '../../utils/http-error';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [
    InputPopup,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  // Signal, not a plain property — this app is zoneless, so a plain property set inside
  // loadPage()'s subscribe() callback below would never trigger p-table's [totalRecords] input
  // to actually update (see the same fix/explanation in dashboard.ts).
  totalItemCount = signal(0);

  constructor(
    private itemService: ItemService,
    private router: Router,
    public authService: AuthService,
    private exportService: ExportService,
    private signalrService: SignalrService,
    private notify: NotificationService,
  ) {
    // Live refresh whenever another client adds/edits/deletes an item.
    this.signalrService.itemsChanged$.pipe(takeUntilDestroyed()).subscribe(() => this.loadPage());
  }

  /*---------------------------------------------------------------------------------------------------*/

  isPopupOpen = signal<boolean>(false);
  onInsert(inpData: ItemReq) {
    if (inpData) {
      this.itemService.insertItem(inpData).subscribe({
        next: (data) => {
          this.notify.success('Item added successfully');
          this.isPopupOpen.set(false);
          this.pageData.update((i) => [...i, data]);
        },
        error: (err) => {
          this.notify.error(errorMessage(err));
        },
      });
    }
  }

  /*---------------------------------------------------------------------------------------------------*/

  onDelete(id: number) {
    this.notify.confirm('Are you sure you want to delete this item?', () => {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.notify.success('Item deleted successfully');
          this.pageData.update((i) => i?.filter((u) => u.itemId !== id));
        },
        error: (err) => {
          this.notify.error("Couldn't delete item: " + errorMessage(err));
        },
      });
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  onUpdate(id: number) {
    this.router.navigate(['itemlist/edit/item', id]);
  }

  /*---------------------------------------------------------------------------------------------------*/

  searchTerm = new FormControl('');
  onSearch() {
    const value = this.searchTerm.value?.trim();
    if (!value) return;

    this.itemService.searchItem(value).subscribe({
      next: (data) => {
        if (data.length >= 1) {
          this.pageData.set(data);
        } else {
          this.notify.info('Item not found');
          this.loadPage();
        }
        this.searchTerm.reset('');
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Search failed due to a server error');
        this.loadPage();
      },
    });
  }

  /*---------------------------------------------------------------------------------------------------*/

  pageData = signal<Item[]>([]);
  pageSize: number = 5;
  pageNumber: number = 1;
  loading = signal<boolean>(true);

  loadPage() {
    this.loading.set(true);
    this.itemService.itemPages(this.pageNumber, this.pageSize).subscribe({
      next: (result) => {
        this.pageData.set(result.items);
        this.totalItemCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        this.notify.error(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const rows = event.rows ?? this.pageSize;
    this.pageSize = rows;
    this.pageNumber = Math.floor((event.first ?? 0) / rows) + 1;
    this.loadPage();
  }

  /*---------------------------------------------------------------------------------------------------*/

  private readonly exportColumns = [
    { header: 'Item Id', key: 'itemId' },
    { header: 'Item Name', key: 'itemName' },
    { header: 'Item Code', key: 'itemCode' },
  ];

  exportCsv() {
    this.exportService.exportToCsv('items', this.exportColumns, this.pageData());
  }

  exportPdf() {
    this.exportService.exportToPdf('items', 'Item Report', this.exportColumns, this.pageData());
  }
}
