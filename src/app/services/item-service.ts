import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, ItemReq } from '../Models/item';
import { PagedResult } from '../Models/PagedResult';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private baseUrl = `${environment.apiUrl}/item`;

  constructor(private http: HttpClient) {}

  getAllItem() {
    return this.http.get<Item[]>(`${this.baseUrl}/allItems`);
  }

  getItemById(id: number) {
    return this.http.get<Item>(`${this.baseUrl}/${id}`);
  }

  insertItem(Data: ItemReq) {
    return this.http.post<Item>(`${this.baseUrl}/add`, Data);
  }

  updateItem(id: number, data: ItemReq) {
    return this.http.put<Item>(`${this.baseUrl}/update/${id}`, data);
  }

  deleteItem(id: number) {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  searchItem(item: string) {
    return this.http.get<Item[]>(`${this.baseUrl}/search/${item}`);
  }

  itemPages(pageNumber: number, pageSize: number) {
    return this.http.get<PagedResult<Item>>(`${this.baseUrl}/pages/${pageNumber}/${pageSize}`);
  }
}
