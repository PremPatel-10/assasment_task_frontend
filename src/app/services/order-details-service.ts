import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Details, DetailsReq } from '../Models/Details';

@Injectable({
  providedIn: 'root',
})
export class OrderDetailsService {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'https://localhost:7254/orderDetail';

  getAllData() {
    return this.http.get<Details>(`${this.apiUrl}/all`);
  }

  getDetailsByOId(id: number) {
    return this.http.get<Details>(`${this.apiUrl}/details/${id}`);
  }

  postDetails(data: DetailsReq) {
    return this.http.post<Details>(`${this.apiUrl}/addDetails`, data);
  }

  putDetails(id: number, data: DetailsReq) {
    return this.http.put<Details>(`${this.apiUrl}/editDetails/${id}`, data);
  }

  postBulkDetails(data: DetailsReq[]) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/bulk`, data);
  }

  getBulkDetails(id: number) {
    return this.http.get<Details[]>(`${this.apiUrl}/getBulk/${id}`);
  }

  putBulkDetails(id: number, data: DetailsReq[]) {
    return this.http.put(`${this.apiUrl}/editBulk/${id}`, data);
  }
}
