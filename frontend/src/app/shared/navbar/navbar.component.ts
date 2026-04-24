import { Component, Input, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
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
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private _role = signal<UserRole>('INVESTOR');

  @Input() set role(value: UserRole) { this._role.set(value); }
  get role(): UserRole { return this._role(); }

  readonly roleLabel = computed(() =>
    this._role() === 'COMPANY' ? 'Ticari Firma' : 'Yatırımcı'
  );

  readonly navItems = computed<NavItem[]>(() => {
    if (this._role() === 'COMPANY') {
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
  });

  readonly userInitial = computed(() =>
    (this.auth.currentUser()?.name ?? 'U')[0].toUpperCase()
  );

  constructor(public auth: AuthService, public theme: ThemeService, public router: Router) {}

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
