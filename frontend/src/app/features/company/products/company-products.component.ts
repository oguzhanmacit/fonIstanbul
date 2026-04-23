import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { Product } from '../../../core/models/models';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-company-products',
  standalone: true,
  imports: [NavbarComponent, FormsModule, CurrencyPipe, DatePipe, NgClass],
  templateUrl: './company-products.component.html',
  styleUrls: ['./company-products.component.css'],
})
export class CompanyProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;
  showModal = false;
  saving = false;
  verifying: string | null = null;
  editId: string | null = null;
  formError = '';

  categories = ['Elektronik', 'Tekstil', 'Gıda', 'Ev Eşyası', 'Kozmetik', 'Kırtasiye', 'Oyuncak', 'Yapı Malzemesi', 'Hobi', 'Aksesuar'];

  form = { name: '', category: '', stockCount: 10, profitRate: 15, termDays: 30, salesLink: '', marketplaceId: '', targetAmount: 10000 };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.http.get<Product[]>(`${API}/company/products`).subscribe({ next: p => { this.products = p; this.loading = false; }, error: () => this.loading = false });
  }

  openModal(): void { this.editId = null; this.form = { name: '', category: '', stockCount: 10, profitRate: 15, termDays: 30, salesLink: '', marketplaceId: '', targetAmount: 10000 }; this.formError = ''; this.showModal = true; }
  closeModal(): void { this.showModal = false; }

  editProduct(p: Product): void {
    this.editId = p.id;
    this.form = { name: p.name, category: p.category, stockCount: p.stockCount, profitRate: p.profitRate, termDays: p.termDays, salesLink: p.salesLink || '', marketplaceId: p.marketplaceId || '', targetAmount: p.targetAmount };
    this.formError = '';
    this.showModal = true;
  }

  saveProduct(): void {
    if (!this.form.name || !this.form.category) { this.formError = 'Zorunlu alanları doldurun'; return; }
    this.saving = true;
    const req = this.editId
      ? this.http.put(`${API}/company/products/${this.editId}`, this.form)
      : this.http.post(`${API}/company/products`, this.form);
    req.subscribe({ next: () => { this.saving = false; this.closeModal(); this.load(); }, error: (e) => { this.formError = e.error?.message || 'Hata oluştu'; this.saving = false; } });
  }

  verify(id: string): void {
    this.verifying = id;
    this.http.post(`${API}/company/products/${id}/verify`, {}).subscribe({ next: () => { this.verifying = null; this.load(); }, error: () => this.verifying = null });
  }

  progress(p: Product): number {
    if (!p.targetAmount) return 0;
    return Math.min(100, Math.round((p.currentAmount / p.targetAmount) * 100));
  }

  statusLabel(s: string): string {
    const map: Record<string,string> = { PENDING: 'Bekliyor', OPEN: 'Açık', FUNDED: 'Tamamlandı', ACTIVE: 'Aktif', COMPLETED: 'Bitti' };
    return map[s] ?? s;
  }

  statusBadge(s: string): string {
    const map: Record<string,string> = { PENDING: 'badge-warning', OPEN: 'badge-success', FUNDED: 'badge-purple', ACTIVE: 'badge-info', COMPLETED: 'badge-gray' };
    return map[s] ?? 'badge-gray';
  }

  ngClass(arg: string): Record<string, boolean> { return { [arg]: true }; }
}
