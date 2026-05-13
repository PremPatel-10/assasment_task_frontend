import { Component, signal } from '@angular/core';
import { ItemService } from '../../services/item-service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Item } from '../../services/itemType';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  allItems: Observable<Item[]> | undefined = undefined;

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.allItems = this.itemService.getAllItem();
  }
}
