import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CurrencyPipe, DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Product, SaleData, ProfitShare, Ownership } from '../../../core/models/models';

const API = 'http://localhost:3000/api';

interface ProductDetailResponse {
  product: Product & { salesData: SaleData[] };
  ownership: Ownership & { investment: { amount: number; createdAt: string; status: string } };
  myProfits: ProfitShare[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NavbarComponent, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  data: ProductDetailResponse | null = null;
  loading = true;
  error = '';
  activeTab: 'sales' | 'profits' = 'sales';

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/yatirimci/yatirimlarim']); return; }
    this.http.get<ProductDetailResponse>(`${API}/investor/products/${encodeURIComponent(id)}`).subscribe({
      next: d => { this.data = d; this.loading = false; },
      error: () => { this.error = 'Ürün yüklenemedi.'; this.loading = false; },
    });
  }

  get totalRevenue(): number {
    return this.data?.product.salesData.reduce((s, r) => s + r.revenue, 0) ?? 0;
  }

  get totalProfit(): number {
    return this.data?.product.salesData.reduce((s, r) => s + r.profit, 0) ?? 0;
  }

  get myTotalProfit(): number {
    return this.data?.myProfits.reduce((s, p) => s + p.amount, 0) ?? 0;
  }

  progress(p: Product): number {
    if (!p.targetAmount) return 0;
    return Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100));
  }

  back(): void { this.router.navigate(['/yatirimci/yatirimlarim']); }
}
