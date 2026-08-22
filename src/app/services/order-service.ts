import { Injectable } from '@angular/core';
import { Order, OrderReq } from '../Models/Order';
import { PagedResult } from '../Models/PagedResult';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = `${environment.apiUrl}/order`;

  constructor(private http: HttpClient) {}

  getAllOrder() {
    return this.http.get<Order[]>(`${this.baseUrl}/allOrder`);
  }

  getOrderById(id: number) {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  insertOrder(Data: OrderReq) {
    return this.http.post<Order>(`${environment.apiUrl}/Order/add`, Data);
  }

  updateOrder(id: number, data: OrderReq) {
    return this.http.put<Order>(`${this.baseUrl}/update/${id}`, data);
  }

  deleteOrder(id: number) {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  searchOrder(vendorName: string) {
    return this.http.get<Order[]>(`${this.baseUrl}/search/${vendorName}`);
  }

  itemPages(pageNumber: number, pageSize: number) {
    return this.http.get<PagedResult<Order>>(`${this.baseUrl}/pages/${pageNumber}/${pageSize}`);
  }

  /** Server-generated .xlsx report of this order and its line items. */
  exportOrderExcel(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/export/excel`, { responseType: 'blob' });
  }

  /** Server-generated .pdf report of this order and its line items. */
  exportOrderPdf(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/export/pdf`, { responseType: 'blob' });
  }
}
