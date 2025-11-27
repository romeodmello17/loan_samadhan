import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private API = 'http://localhost:8080/api/leads';

  constructor(private http: HttpClient) {}

  createLead(leadData: any): Observable<any> {
    return this.http.post(this.API, leadData);
  }
}
