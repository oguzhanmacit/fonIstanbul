import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserRole } from '../../core/models/models';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  @Input() role: UserRole = 'INVESTOR';

  constructor(public auth: AuthService, public theme: ThemeService) {}

  get roleLabel(): string {
    return this.role === 'COMPANY' ? 'Ticari Firma' : 'Yatırımcı';
  }

  get userInitial(): string {
    return (this.auth.currentUser()?.name ?? 'U')[0].toUpperCase();
  }

  get navItems(): NavItem[] {
    if (this.role === 'COMPANY') {
      return [
        { label: 'Genel Bakış', icon: '📊', path: '/firma/panel' },
        { label: 'Ürünlerim', icon: '📦', path: '/firma/urunler' },
        { label: 'Yatırımlar', icon: '💼', path: '/firma/yatirimlar' },
      ];
    }
    return [
      { label: 'Genel Bakış', icon: '📊', path: '/yatirimci/panel' },
      { label: 'Pazar Yeri', icon: '🛒', path: '/yatirimci/pazar' },
      { label: 'Yatırımlarım', icon: '💼', path: '/yatirimci/yatirimlarim' },
      { label: 'Kârlarım', icon: '💰', path: '/yatirimci/karlarim' },
    ];
  }
}
