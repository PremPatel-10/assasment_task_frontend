import { Component, signal } from '@angular/core';
import { ItemService } from '../../services/item-service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Item } from '../../services/itemType';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  items$ = signal<Observable<Item[]> | undefined>(undefined);

  constructor(private itemService: ItemService) {}

  ngOnInit() {
    this.items$.set(this.itemService.getAllItem());
  }
}
