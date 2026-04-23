import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../core/auth/auth.service';
import { CompanyStats } from '../../core/models/models';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [NavbarComponent, RouterLink, CurrencyPipe, DecimalPipe],
  templateUrl: './company-dashboard.component.html',
  styleUrls: ['./company-dashboard.component.css'],
})
export class CompanyDashboardComponent implements OnInit {
  stats: CompanyStats | null = null;
  today = new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void {
    this.http.get<CompanyStats>('http://localhost:3000/api/company/stats').subscribe({
      next: s => this.stats = s,
      error: () => this.stats = { totalProducts: 0, openProducts: 0, totalInvestments: 0, pendingInvestments: 0, totalInvestmentAmount: 0, totalRevenue: 0, totalProfit: 0 },
    });
  }
}
