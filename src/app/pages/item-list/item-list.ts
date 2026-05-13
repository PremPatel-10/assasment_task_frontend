import { Component, signal } from '@angular/core';
import { ItemService } from '../../services/item-service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Item } from '../../services/itemType';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  allItems = signal<Observable<Item[]> | undefined>(undefined);

  constructor(
    private itemService: ItemService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.allItems.set(this.itemService.getAllItem());
  }

  onDelete(id: number) {
    this.itemService.deleteItem(id).subscribe(() => {
      this.allItems.set(this.itemService.getAllItem());
    });
    alert('Data Deleted');
  }

  onUpdate(id: number) {
    this.router.navigate(['/edit', id]);
  }
}
