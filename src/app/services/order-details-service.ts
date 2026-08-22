import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Details, DetailsReq } from '../Models/Details';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderDetailsService {
  private baseUrl = `${environment.apiUrl}/orderDetail`;

  constructor(private http: HttpClient) {}

  getAllData() {
    return this.http.get<Details>(`${this.baseUrl}/all`);
  }

  getDetailsByOId(id: number) {
    return this.http.get<Details>(`${this.baseUrl}/details/${id}`);
  }

  postDetails(data: DetailsReq) {
    return this.http.post<Details>(`${this.baseUrl}/addDetails`, data);
  }

  putDetails(id: number, data: DetailsReq) {
    return this.http.put<Details>(`${this.baseUrl}/editDetails/${id}`, data);
  }

  postBulkDetails(data: DetailsReq[]) {
    return this.http.post(`${this.baseUrl}/bulk`, data);
  }

  getBulkDetailsById(id: number) {
    return this.http.get<Details[]>(`${this.baseUrl}/getBulk/${id}`);
  }

  putBulkDetails(id: number, data: DetailsReq[]) {
    return this.http.put(`${this.baseUrl}/editBulk/${id}`, data);
  }
}
