import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function getOpenProducts(req: AuthRequest, res: Response): Promise<void> {
  const { category, search } = req.query;

  const products = await prisma.product.findMany({
    where: {
      status: { in: ['OPEN', 'FUNDED'] },
      ...(category ? { category: String(category) } : {}),
      ...(search ? { name: { contains: String(search) } } : {}),
    },
    include: {
      company: { select: { companyName: true } },
      _count: { select: { investments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
}

export async function getProductDetail(req: AuthRequest, res: Response): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      company: { select: { companyName: true, address: true } },
      _count: { select: { investments: true } },
      salesData: { orderBy: { recordedAt: 'desc' }, take: 10 },
    },
  });

  if (!product) {
    res.status(404).json({ message: 'Ürün bulunamadı' });
    return;
  }

  const myOwnership = await prisma.ownership.findFirst({
    where: { productId: req.params.id, userId: req.user!.id },
  });

  res.json({ ...product, myOwnership });
}

export async function getProductSales(req: AuthRequest, res: Response): Promise<void> {
  const sales = await prisma.saleData.findMany({
    where: { productId: req.params.id },
    orderBy: { recordedAt: 'desc' },
    take: 30,
  });
  res.json(sales);
}
