import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Investment } from '../../../core/models/models';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-my-investments',
  standalone: true,
  imports: [NavbarComponent, FormsModule, RouterLink, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './my-investments.component.html',
  styleUrls: ['./my-investments.component.css'],
})
export class MyInvestmentsComponent implements OnInit {
  investments: Investment[] = [];
  loading = true;
  selectedInv: Investment | null = null;
  invoiceNo = '';
  invoiceFile: File | null = null;
  uploading = false;
  invoiceError = '';
  invoiceSuccess = '';

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<Investment[]>(`${API}/investor/investments`).subscribe({ next: d => { this.investments = d; this.loading = false; }, error: () => this.loading = false });
  }

  statusLabel(s: string): string {
    return { PENDING: 'Bekliyor', CONFIRMED: 'Onaylandı', REJECTED: 'Reddedildi' }[s] ?? s;
  }

  openInvoice(inv: Investment): void {
    this.selectedInv = inv;
    this.invoiceNo = '';
    this.invoiceFile = null;
    this.invoiceError = '';
    this.invoiceSuccess = '';
  }

  closeInvoice(): void { this.selectedInv = null; }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.invoiceFile = input.files?.[0] ?? null;
  }

  uploadInvoice(): void {
    if (!this.selectedInv || !this.invoiceNo || !this.invoiceFile) {
      this.invoiceError = 'Fatura numarası ve dosya zorunludur';
      return;
    }
    this.uploading = true;
    const fd = new FormData();
    fd.append('productId', this.selectedInv.product!.id!);
    fd.append('invoiceNo', this.invoiceNo);
    fd.append('invoice', this.invoiceFile);
    this.http.post(`${API}/investor/invoices`, fd).subscribe({
      next: () => { this.invoiceSuccess = 'E-fatura yüklendi, doğrulama bekleniyor.'; this.uploading = false; },
      error: (e) => { this.invoiceError = e.error?.message || 'Hata oluştu'; this.uploading = false; },
    });
  }
}
