import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item } from './itemType';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private http: HttpClient) {}

  getAllItem() {
    return this.http.get<Item[]>(`https://localhost:7254/item/allItems`);
  }

  deleteItem(id: number) {
    return this.http.delete<Item>(`https://localhost:7254/item/delete/${id}`);
  }
}
