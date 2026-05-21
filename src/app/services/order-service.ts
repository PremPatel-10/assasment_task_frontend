import { Injectable } from '@angular/core';
import { Order, OrderReq } from '../Models/Order';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  getAllOrder() {
    return this.http.get<Order[]>(`https://localhost:7254/order/allOrder`);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`https://localhost:7254/order/${id}`);
  }

  insertOrder(Data: OrderReq) {
    return this.http.post<Order>(`https://localhost:7254/Order/add`, Data);
  }

  updateOrder(id: number, data: OrderReq) {
    return this.http.put<Order>(`https://localhost:7254/order/update/${id}`, data);
  }

  deleteOrder(id: number) {
    return this.http.delete(`https://localhost:7254/order/delete/${id}`);
  }

  searchOrder(item: string) {
    return this.http.get<Order[]>(`https://localhost:7254/order/search/${item}`);
  }

  itemPages(pageNumber: number, pageSize: number) {
    return this.http.get<Order[]>(`https://localhost:7254/order/pages/${pageNumber}/${pageSize}`);
  }
}
