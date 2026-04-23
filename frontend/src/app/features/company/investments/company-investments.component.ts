import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { Investment } from '../../../core/models/models';
import { CurrencyPipe, DatePipe } from '@angular/common';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-company-investments',
  standalone: true,
  imports: [NavbarComponent, CurrencyPipe, DatePipe],
  templateUrl: './company-investments.component.html',
})
export class CompanyInvestmentsComponent implements OnInit {
  investments: Investment[] = [];
  loading = true;
  confirming: string | null = null;

  get pending(): Investment[] { return this.investments.filter(i => i.status === 'PENDING'); }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Investment[]>(`${API}/company/investments`).subscribe({ next: d => { this.investments = d; this.loading = false; }, error: () => this.loading = false });
  }

  confirm(id: string): void {
    this.confirming = id;
    this.http.post(`${API}/company/investments/${id}/confirm-delivery`, {}).subscribe({ next: () => { this.confirming = null; this.load(); }, error: () => this.confirming = null });
  }

  statusLabel(s: string): string {
    return { PENDING: 'Bekliyor', CONFIRMED: 'Onaylandı', REJECTED: 'Reddedildi' }[s] ?? s;
  }
}
