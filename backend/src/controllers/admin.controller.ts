import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function verifyInvoice(req: AuthRequest, res: Response): Promise<void> {
  const { approved, bonusRate } = req.body;
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
  if (!invoice) { res.status(404).json({ message: 'Fatura bulunamadı' }); return; }

  await prisma.invoice.update({
    where: { id: req.params.id },
    data: {
      status: approved ? 'VERIFIED' : 'REJECTED',
      verifiedAt: new Date(),
      bonusRate: approved ? Number(bonusRate ?? 2) : null,
    },
  });

  if (approved) {
    await prisma.ownership.updateMany({
      where: { userId: invoice.userId, productId: invoice.productId },
      data: { sharePercent: { increment: Number(bonusRate ?? 2) } },
    });
  }

  res.json({ message: approved ? 'Fatura onaylandı' : 'Fatura reddedildi' });
}

export async function addSaleData(req: AuthRequest, res: Response): Promise<void> {
  const { saleCount, revenue, profit } = req.body;
  const productId = req.params.id;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { ownerships: true },
  });
  if (!product) { res.status(404).json({ message: 'Ürün bulunamadı' }); return; }

  await prisma.saleData.create({
    data: {
      productId,
      saleCount: Number(saleCount),
      revenue: Number(revenue),
      profit: Number(profit),
    },
  });

  const totalSharePercent = product.ownerships.reduce((s, o) => s + o.sharePercent, 0);

  for (const ownership of product.ownerships) {
    const investorShare = (ownership.sharePercent / 100) * Number(profit);
    if (investorShare > 0) {
      await prisma.profitShare.create({
        data: {
          userId: ownership.userId,
          productId,
          amount: investorShare,
          type: 'CAPITAL',
          status: 'PENDING',
        },
      });
    }
  }

  const companyShare = ((100 - totalSharePercent) / 100) * Number(profit);
  await prisma.product.update({
    where: { id: productId },
    data: { status: Number(saleCount) >= product.stockCount ? 'COMPLETED' : product.status },
  });

  res.json({ message: 'Satış verisi eklendi', companyShare });
}

export async function processPayments(req: AuthRequest, res: Response): Promise<void> {
  const pending = await prisma.profitShare.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { name: true, email: true } } },
  });

  await prisma.profitShare.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'PAID', paidAt: new Date() },
  });

  res.json({ message: `${pending.length} ödeme işlendi`, processed: pending.length });
}
