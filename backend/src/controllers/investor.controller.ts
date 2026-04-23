import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export async function getMyStats(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  const [totalInvestments, activeInvestments] = await Promise.all([
    prisma.investment.count({ where: { userId } }),
    prisma.investment.count({ where: { userId, status: 'CONFIRMED' } }),
  ]);

  const investedSum = await prisma.investment.aggregate({
    where: { userId, status: 'CONFIRMED', type: 'CASH' },
    _sum: { amount: true },
  });

  const profitSum = await prisma.profitShare.aggregate({
    where: { userId },
    _sum: { amount: true },
  });

  const paidProfitSum = await prisma.profitShare.aggregate({
    where: { userId, status: 'PAID' },
    _sum: { amount: true },
  });

  res.json({
    totalInvestments,
    activeInvestments,
    totalInvested: investedSum._sum.amount ?? 0,
    totalProfitEarned: profitSum._sum.amount ?? 0,
    paidProfit: paidProfitSum._sum.amount ?? 0,
  });
}

export async function invest(req: AuthRequest, res: Response): Promise<void> {
  const { productId, amount } = req.body;
  const userId = req.user!.id;

  if (!productId || !amount || Number(amount) <= 0) {
    res.status(400).json({ message: 'Ürün ve geçerli bir tutar gerekli' });
    return;
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== 'OPEN') {
    res.status(400).json({ message: 'Ürün yatırıma açık değil' });
    return;
  }

  const investment = await prisma.investment.create({
    data: {
      userId,
      productId,
      type: 'CASH',
      amount: Number(amount),
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });

  const sharePercent = (Number(amount) / product.targetAmount) * 100;
  await prisma.ownership.create({
    data: { userId, productId, investmentId: investment.id, sharePercent },
  });

  const newAmount = product.currentAmount + Number(amount);
  const newStatus = newAmount >= product.targetAmount ? 'FUNDED' : 'OPEN';
  await prisma.product.update({
    where: { id: productId },
    data: { currentAmount: newAmount, status: newStatus },
  });

  res.status(201).json({ message: 'Yatırım talebi oluşturuldu', investment });
}

export async function getMyInvestments(req: AuthRequest, res: Response): Promise<void> {
  const investments = await prisma.investment.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        select: { id: true, name: true, category: true, profitRate: true, termDays: true, status: true },
      },
      ownership: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(investments);
}

export async function getMyProfits(req: AuthRequest, res: Response): Promise<void> {
  const profits = await prisma.profitShare.findMany({
    where: { userId: req.user!.id },
    include: {
      product: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(profits);
}

export async function uploadInvoice(req: AuthRequest, res: Response): Promise<void> {
  const { productId, invoiceNo } = req.body;
  const userId = req.user!.id;

  if (!req.file || !productId || !invoiceNo) {
    res.status(400).json({ message: 'Fatura dosyası, ürün ve fatura numarası gerekli' });
    return;
  }

  const ownership = await prisma.ownership.findFirst({ where: { userId, productId } });
  if (!ownership) {
    res.status(400).json({ message: 'Bu ürüne yatırımınız bulunmuyor' });
    return;
  }

  const invoice = await prisma.invoice.create({
    data: {
      userId,
      productId,
      invoiceNo,
      fileName: req.file.filename,
      status: 'PENDING',
    },
  });

  res.status(201).json({ message: 'E-fatura yüklendi, doğrulama bekleniyor', invoice });
}
