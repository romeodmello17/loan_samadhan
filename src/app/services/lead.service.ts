import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  // private API = 'http://localhost:3000/api/lead';
  private API = 'https://lead-proxy-backend.onrender.com/api/lead';

  constructor(private http: HttpClient) {}

  createLead(leadData: any): Observable<any> {
    return this.http.post(this.API, leadData);
  }
}
