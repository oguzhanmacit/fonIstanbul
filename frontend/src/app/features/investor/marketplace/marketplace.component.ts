import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Product } from '../../../core/models/models';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CurrencyPipe, DecimalPipe, NgClass],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.css'],
})
export class MarketplaceComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  loading = true;
  search = '';
  selectedCat = '';
  categories = ['Elektronik', 'Tekstil', 'Gıda', 'Ev Eşyası', 'Kozmetik', 'Kırtasiye', 'Oyuncak', 'Yapı Malzemesi', 'Hobi', 'Aksesuar'];

  selectedProduct: Product | null = null;
  amount = 0;
  amountDisplay = '';
  investing = false;
  investError = '';
  investSuccess = '';

  hoveredId: string | null = null;
  watchingProduct: Product | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Product[]>(`${API}/products`).subscribe({
      next: p => { this.products = p; this.filtered = p; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  filter(): void {
    this.filtered = this.products.filter(p =>
      (!this.search || p.name.toLowerCase().includes(this.search.toLowerCase())) &&
      (!this.selectedCat || p.category === this.selectedCat)
    );
  }

  progress(p: Product): number {
    if (!p.targetAmount) return 0;
    return Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100));
  }

  get sharePercent(): number {
    if (!this.selectedProduct || !this.amount) return 0;
    return (this.amount / this.selectedProduct.targetAmount) * 100;
  }

  get estimatedProfit(): number {
    if (!this.selectedProduct || !this.amount) return 0;
    return this.amount * (this.selectedProduct.profitRate / 100);
  }

  openInvest(p: Product): void {
    if (p.status !== 'OPEN') return;
    this.selectedProduct = p;
    this.amount = 0;
    this.amountDisplay = '';
    this.investError = '';
    this.investSuccess = '';
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\./g, '').replace(/\D/g, '');
    this.amount = parseInt(raw, 10) || 0;
    this.amountDisplay = this.amount > 0 ? this.amount.toLocaleString('tr-TR') : '';
    input.value = this.amountDisplay;
  }

  closeInvest(): void { this.selectedProduct = null; }

  invest(): void {
    if (!this.selectedProduct) return;
    this.investError = '';
    this.investing = true;
    const body = { productId: this.selectedProduct.id, amount: this.amount };
    this.http.post(`${API}/investor/invest`, body).subscribe({
      next: () => {
        this.investSuccess = 'Yatırımınız başarıyla oluşturuldu!';
        this.investing = false;
        this.load();
      },
      error: (e) => {
        this.investError = e.error?.message || 'Hata oluştu';
        this.investing = false;
      },
    });
  }

  openWatch(p: Product): void { this.watchingProduct = p; }
  closeWatch(): void { this.watchingProduct = null; }

  onCardEnter(id: string): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => { this.hoveredId = id; }, 450);
  }

  onCardLeave(): void {
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
    this.hoveredId = null;
  }

  categoryEmoji(cat: string): string {
    const map: Record<string, string> = {
      'Elektronik': '💻', 'Tekstil': '👗', 'Gıda': '🍎', 'Ev Eşyası': '🏠',
      'Kozmetik': '💄', 'Kırtasiye': '📚', 'Oyuncak': '🧸', 'Yapı Malzemesi': '🔨',
      'Hobi': '🎨', 'Aksesuar': '👜',
    };
    return map[cat] ?? '📦';
  }

  categoryClass(cat: string): string {
    const map: Record<string, string> = {
      'Elektronik': 'cat-elektronik', 'Tekstil': 'cat-tekstil', 'Gıda': 'cat-gida',
      'Ev Eşyası': 'cat-ev', 'Kozmetik': 'cat-kozmetik', 'Kırtasiye': 'cat-kirtasiye',
      'Oyuncak': 'cat-oyuncak', 'Yapı Malzemesi': 'cat-yapi', 'Hobi': 'cat-hobi',
      'Aksesuar': 'cat-aksesuar',
    };
    return map[cat] ?? 'cat-default';
  }
}
