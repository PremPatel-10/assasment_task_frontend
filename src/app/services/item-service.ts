import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, ItemReq } from '../Models/item';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'https://localhost:7254/item';

  getAllItem() {
    return this.http.get<Item[]>(`${this.apiUrl}/allItems`);
  }

  getActiveItems() {
    return this.http.get<Item[]>(`${this.apiUrl}/activeItems`);
  }

  getItemById(id: number) {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  insertItem(Data: ItemReq) {
    return this.http.post<Item>(`${this.apiUrl}/add`, Data);
  }

  updateItem(id: number, data: ItemReq) {
    return this.http.put<Item>(`${this.apiUrl}/update/${id}`, data);
  }

  deleteItem(id: number) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  searchItem(item: string) {
    return this.http.get<Item[]>(`${this.apiUrl}/search/${item}`);
  }

  itemPages(pageNumber: number, pageSize: number) {
    return this.http.get<Item[]>(`${this.apiUrl}/pages/${pageNumber}/${pageSize}`);
  }
}
