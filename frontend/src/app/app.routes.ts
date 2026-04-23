import { Routes } from '@angular/router';
import { authGuard, companyGuard, investorGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'giris',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'kayit',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'firma',
    canActivate: [authGuard, companyGuard],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', loadComponent: () => import('./features/company/company-dashboard.component').then(m => m.CompanyDashboardComponent) },
      { path: 'urunler', loadComponent: () => import('./features/company/products/company-products.component').then(m => m.CompanyProductsComponent) },
      { path: 'yatirimlar', loadComponent: () => import('./features/company/investments/company-investments.component').then(m => m.CompanyInvestmentsComponent) },
    ],
  },
  {
    path: 'yatirimci',
    canActivate: [authGuard, investorGuard],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', loadComponent: () => import('./features/investor/investor-dashboard.component').then(m => m.InvestorDashboardComponent) },
      { path: 'pazar', loadComponent: () => import('./features/investor/marketplace/marketplace.component').then(m => m.MarketplaceComponent) },
      { path: 'yatirimlarim', loadComponent: () => import('./features/investor/my-investments/my-investments.component').then(m => m.MyInvestmentsComponent) },
      { path: 'karlarim', loadComponent: () => import('./features/investor/profits/profits.component').then(m => m.ProfitsComponent) },
    ],
  },
  {
    path: 'panel',
    canActivate: [authGuard],
    loadComponent: () => import('./features/panel-redirect/panel-redirect.component').then(m => m.PanelRedirectComponent),
  },
  { path: '**', redirectTo: '' },
];
