import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

async function getCompanyId(userId: string): Promise<string | null> {
  const p = await prisma.companyProfile.findUnique({ where: { userId } });
  return p?.id ?? null;
}

// Mock marketplace API verification
async function verifyWithMarketplace(product: { name: string; marketplaceId?: string | null }): Promise<boolean> {
  // In real system this calls external marketplace API using sellerId & apiKey
  return true;
}

export async function getCompanyStats(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  if (!companyId) { res.status(404).json({ message: 'Firma profili bulunamadı' }); return; }

  const [totalProducts, openProducts, totalInvestments, pendingInvestments] = await Promise.all([
    prisma.product.count({ where: { companyId } }),
    prisma.product.count({ where: { companyId, status: 'OPEN' } }),
    prisma.investment.count({ where: { product: { companyId } } }),
    prisma.investment.count({ where: { product: { companyId }, status: 'PENDING' } }),
  ]);

  const investmentSum = await prisma.investment.aggregate({
    where: { product: { companyId }, status: 'CONFIRMED' },
    _sum: { amount: true },
  });

  const salesSum = await prisma.saleData.aggregate({
    where: { product: { companyId } },
    _sum: { revenue: true, profit: true },
  });

  res.json({
    totalProducts,
    openProducts,
    totalInvestments,
    pendingInvestments,
    totalInvestmentAmount: investmentSum._sum.amount ?? 0,
    totalRevenue: salesSum._sum.revenue ?? 0,
    totalProfit: salesSum._sum.profit ?? 0,
  });
}

export async function getCompanyProducts(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  if (!companyId) { res.status(404).json({ message: 'Firma profili bulunamadı' }); return; }

  const products = await prisma.product.findMany({
    where: { companyId },
    include: {
      _count: { select: { investments: true } },
      salesData: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
}

export async function createProduct(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  if (!companyId) { res.status(404).json({ message: 'Firma profili bulunamadı' }); return; }

  const { name, category, stockCount, profitRate, termDays, salesLink, marketplaceId, targetAmount } = req.body;

  if (!name || !category || !stockCount || !profitRate || !termDays || !targetAmount) {
    res.status(400).json({ message: 'Gerekli alanlar eksik' });
    return;
  }

  const product = await prisma.product.create({
    data: {
      companyId,
      name,
      category,
      stockCount: Number(stockCount),
      profitRate: Number(profitRate),
      termDays: Number(termDays),
      salesLink,
      marketplaceId,
      targetAmount: Number(targetAmount),
      status: 'PENDING',
    },
  });
  res.status(201).json(product);
}

export async function updateProduct(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  const product = await prisma.product.findFirst({ where: { id: req.params.id, companyId: companyId ?? '' } });
  if (!product) { res.status(404).json({ message: 'Ürün bulunamadı' }); return; }
  if (product.status !== 'PENDING') { res.status(400).json({ message: 'Sadece bekleyen ürünler düzenlenebilir' }); return; }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
}

export async function deleteProduct(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  const product = await prisma.product.findFirst({ where: { id: req.params.id, companyId: companyId ?? '' } });
  if (!product) { res.status(404).json({ message: 'Ürün bulunamadı' }); return; }
  if (!['PENDING'].includes(product.status)) { res.status(400).json({ message: 'Aktif ürünler silinemez' }); return; }

  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ message: 'Ürün silindi' });
}

export async function verifyProduct(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  const product = await prisma.product.findFirst({ where: { id: req.params.id, companyId: companyId ?? '' } });
  if (!product) { res.status(404).json({ message: 'Ürün bulunamadı' }); return; }

  const isVerified = await verifyWithMarketplace(product);
  if (!isVerified) { res.status(400).json({ message: 'Pazar yeri doğrulaması başarısız' }); return; }

  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { status: 'OPEN', verifiedAt: new Date() },
  });
  res.json(updated);
}

export async function getCompanyInvestments(req: AuthRequest, res: Response): Promise<void> {
  const companyId = await getCompanyId(req.user!.id);
  if (!companyId) { res.status(404).json({ message: 'Firma profili bulunamadı' }); return; }

  const investments = await prisma.investment.findMany({
    where: { product: { companyId } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(investments);
}

export async function confirmProductDelivery(req: AuthRequest, res: Response): Promise<void> {
  const investment = await prisma.investment.findUnique({
    where: { id: req.params.id },
    include: { product: { include: { company: true } } },
  });
  if (!investment) { res.status(404).json({ message: 'Yatırım bulunamadı' }); return; }
  if (investment.product.company.userId !== req.user!.id) { res.status(403).json({ message: 'Yetkisiz' }); return; }

  await prisma.investment.update({
    where: { id: req.params.id },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  });

  const totalInvested = investment.amount ?? 0;
  const product = await prisma.product.findUnique({ where: { id: investment.productId } });
  const sharePercent = product ? (totalInvested / product.targetAmount) * 100 : 0;

  await prisma.ownership.create({
    data: {
      userId: investment.userId,
      productId: investment.productId,
      investmentId: investment.id,
      sharePercent,
    },
  });

  await prisma.product.update({
    where: { id: investment.productId },
    data: { currentAmount: { increment: Number(investment.amount ?? 0) } },
  });

  res.json({ message: 'Teslimat onaylandı, sahiplik devri oluşturuldu' });
}
