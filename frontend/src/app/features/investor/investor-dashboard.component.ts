import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../core/auth/auth.service';
import { InvestorStats } from '../../core/models/models';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-investor-dashboard',
  standalone: true,
  imports: [NavbarComponent, RouterLink, CurrencyPipe],
  templateUrl: './investor-dashboard.component.html',
  styleUrls: ['./investor-dashboard.component.css'],
})
export class InvestorDashboardComponent implements OnInit {
  stats: InvestorStats | null = null;
  today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void {
    this.http.get<InvestorStats>('http://localhost:3000/api/investor/stats').subscribe({
      next: s => this.stats = s,
      error: () => this.stats = { totalInvestments: 0, activeInvestments: 0, totalInvested: 0, totalProfitEarned: 0, paidProfit: 0 },
    });
  }
}
