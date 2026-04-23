import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  templateUrl: './panel-redirect.component.html',
})
export class PanelRedirectComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isCompany()) {
      this.router.navigate(['/firma/panel']);
    } else if (this.auth.isInvestor()) {
      this.router.navigate(['/yatirimci/panel']);
    } else {
      this.router.navigate(['/giris']);
    }
  }
}
