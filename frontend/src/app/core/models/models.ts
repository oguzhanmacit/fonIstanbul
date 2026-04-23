export type UserRole = 'COMPANY' | 'INVESTOR';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  companyProfile?: CompanyProfile;
  investorProfile?: InvestorProfile;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  taxNumber: string;
  address: string;
  sellerId?: string;
  apiKey?: string;
}

export interface InvestorProfile {
  id: string;
  idNumber?: string;
  bankIban?: string;
}

export type ProductStatus = 'PENDING' | 'OPEN' | 'FUNDED' | 'ACTIVE' | 'COMPLETED';

export interface Product {
  id: string;
  name: string;
  category: string;
  stockCount: number;
  profitRate: number;
  termDays: number;
  salesLink?: string;
  marketplaceId?: string;
  targetAmount: number;
  currentAmount: number;
  status: ProductStatus;
  verifiedAt?: string;
  createdAt: string;
  company?: { companyName: string };
  _count?: { investments: number };
  myOwnership?: Ownership;
  salesData?: SaleData[];
}

export type InvestmentType = 'CASH' | 'PRODUCT';
export type InvestmentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface Investment {
  id: string;
  type: InvestmentType;
  amount?: number;
  productCount?: number;
  status: InvestmentStatus;
  createdAt: string;
  confirmedAt?: string;
  product?: Partial<Product>;
  user?: Partial<User>;
  ownership?: Ownership;
}

export interface Ownership {
  id: string;
  sharePercent: number;
  createdAt: string;
}

export interface ProfitShare {
  id: string;
  amount: number;
  type: 'CAPITAL' | 'INVOICE_BONUS';
  status: 'PENDING' | 'PAID';
  createdAt: string;
  paidAt?: string;
  product?: Partial<Product>;
}

export interface SaleData {
  id: string;
  saleCount: number;
  revenue: number;
  profit: number;
  recordedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  fileName: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  bonusRate?: number;
  uploadedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CompanyStats {
  totalProducts: number;
  openProducts: number;
  totalInvestments: number;
  pendingInvestments: number;
  totalInvestmentAmount: number;
  totalRevenue: number;
  totalProfit: number;
}

export interface InvestorStats {
  totalInvestments: number;
  activeInvestments: number;
  totalInvested: number;
  totalProfitEarned: number;
  paidProfit: number;
}
