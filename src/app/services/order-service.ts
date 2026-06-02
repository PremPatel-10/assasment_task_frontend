import { Injectable } from '@angular/core';
import { Order, OrderReq } from '../Models/Order';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'https://localhost:7254/order';

  getAllOrder() {
    return this.http.get<Order[]>(`${this.apiUrl}/allOrder`);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  insertOrder(Data: OrderReq) {
    return this.http.post<Order>(`${this.apiUrl}/add`, Data);
  }

  updateOrder(id: number, data: OrderReq) {
    return this.http.put<Order>(`${this.apiUrl}/update/${id}`, data);
  }

  deleteOrder(id: number) {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }

  searchOrder(vendorName: string) {
    return this.http.get<Order[]>(`${this.apiUrl}/search/${vendorName}`);
  }

  itemPages(pageNumber: number, pageSize: number) {
    return this.http.get<Order[]>(`${this.apiUrl}/pages/${pageNumber}/${pageSize}`);
  }
}
