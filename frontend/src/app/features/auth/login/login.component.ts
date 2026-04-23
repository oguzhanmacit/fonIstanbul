import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  fillDemo(email: string): void {
    this.email = email;
    this.password = 'demo1234';
  }

  onLogin(): void {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        const role = res.user.role;
        if (role === 'COMPANY') this.router.navigate(['/firma/panel']);
        else this.router.navigate(['/yatirimci/panel']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Giriş başarısız';
        this.loading = false;
      },
    });
  }
}
