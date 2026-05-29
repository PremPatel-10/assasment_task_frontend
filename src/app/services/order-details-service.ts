import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Details, DetailsReq } from '../Models/Details';

@Injectable({
  providedIn: 'root',
})
export class OrderDetailsService {
  constructor(private http: HttpClient) {}

  getAllData() {
    return this.http.get<Details>(`https://localhost:7254/orderDetail/all`);
  }

  getDetailsByOId(id: number) {
    return this.http.get<Details>(`https://localhost:7254/orderDetail/details/${id}`);
  }

  postDetails(data: DetailsReq) {
    return this.http.post<Details>(`https://localhost:7254/orderDetail/addDetails`, data);
  }

  putDetails(id: number, data: DetailsReq) {
    return this.http.put<Details>(`https://localhost:7254/orderDetail/editDetails/${id}`, data);
  }

  postBulkDetails(data: DetailsReq[]) {
    return this.http.post(`https://localhost:7254/orderDetail/bulk`, data);
  }

  getBulkDetails(id: number) {
    return this.http.get<Details[]>(`https://localhost:7254/orderDetail/getBulk/${id}`);
  }

  putBulkDetails(id: number, data: DetailsReq[]) {
    return this.http.put(`https://localhost:7254/orderDetail/editBulk/${id}`, data);
  }
}
