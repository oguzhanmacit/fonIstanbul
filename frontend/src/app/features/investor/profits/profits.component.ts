import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfitShare } from '../../../core/models/models';
import { CurrencyPipe, DatePipe } from '@angular/common';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-profits',
  standalone: true,
  imports: [NavbarComponent, CurrencyPipe, DatePipe],
  templateUrl: './profits.component.html',
  styleUrls: ['./profits.component.css'],
})
export class ProfitsComponent implements OnInit {
  profits: ProfitShare[] = [];
  loading = true;

  get totalProfit(): number { return this.profits.reduce((s, p) => s + p.amount, 0); }
  get paidProfit(): number { return this.profits.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0); }
  get pendingProfit(): number { return this.profits.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0); }

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void {
    this.http.get<ProfitShare[]>(`${API}/investor/profits`).subscribe({ next: d => { this.profits = d; this.loading = false; }, error: () => this.loading = false });
  }
}
