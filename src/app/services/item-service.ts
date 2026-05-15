import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Item, ItemReq } from './itemType';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private http: HttpClient) {}

  getAllItem() {
    return this.http.get<Item[]>(`https://localhost:7254/item/allItems`);
  }

  getItemById(id: number) {
    return this.http.get<Item>(`https://localhost:7254/item/${id}`);
  }

  insertItem(Data: ItemReq) {
    return this.http.post<Item>(`https://localhost:7254/item/add`, Data);
  }

  updateItem(id: number, data: ItemReq) {
    return this.http.put<Item>(`https://localhost:7254/item/update/${id}`, data);
  }

  deleteItem(id: number) {
    return this.http.delete(`https://localhost:7254/item/delete/${id}`);
  }

  searchItem(item: string) {
    return this.http.get<Item[]>(`https://localhost:7254/item/search/${item}`);
  }

  itemPages(noOfPages: number, sizeOfPage: number) {
    return this.http.get<Item[]>(`https://localhost:7254/item/pages/${noOfPages}/${sizeOfPage}`);
  }
}
