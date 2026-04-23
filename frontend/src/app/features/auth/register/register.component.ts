import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  role: UserRole = 'INVESTOR';
  name = '';
  email = '';
  phone = '';
  password = '';
  companyName = '';
  taxNumber = '';
  address = '';
  idNumber = '';
  bankIban = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegister(): void {
    this.error = '';
    this.loading = true;
    const data = {
      name: this.name, email: this.email, phone: this.phone,
      password: this.password, role: this.role,
      companyName: this.companyName, taxNumber: this.taxNumber, address: this.address,
      idNumber: this.idNumber, bankIban: this.bankIban,
    };
    this.auth.register(data).subscribe({
      next: (res) => {
        if (res.user.role === 'COMPANY') this.router.navigate(['/firma/panel']);
        else this.router.navigate(['/yatirimci/panel']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Kayıt başarısız';
        this.loading = false;
      },
    });
  }
}
