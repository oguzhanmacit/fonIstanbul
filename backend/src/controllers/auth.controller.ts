import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

function signToken(payload: object): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name, phone, role, companyName, taxNumber, address, idNumber, bankIban } = req.body;

  if (!email || !password || !name || !role) {
    res.status(400).json({ message: 'Gerekli alanlar eksik' });
    return;
  }

  const validRoles = ['COMPANY', 'INVESTOR'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ message: 'Geçersiz kullanıcı tipi' });
    return;
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    res.status(409).json({ message: 'Bu e-posta adresi zaten kayıtlı' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      phone,
      role,
      ...(role === 'COMPANY' && {
        companyProfile: {
          create: { companyName: companyName || name, taxNumber: taxNumber || '', address: address || '' },
        },
      }),
      ...(role === 'INVESTOR' && {
        investorProfile: {
          create: { idNumber, bankIban },
        },
      }),
    },
    include: { companyProfile: true, investorProfile: true },
  });

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'E-posta ve şifre gerekli' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { companyProfile: true, investorProfile: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
    return;
  }

  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyProfile: user.companyProfile,
      investorProfile: user.investorProfile,
    },
  });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { companyProfile: true, investorProfile: true },
    omit: { password: true },
  });
  if (!user) {
    res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    return;
  }
  res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const { name, phone, companyName, taxNumber, address, bankIban } = req.body;
  const userId = req.user!.id;

  await prisma.user.update({
    where: { id: userId },
    data: { name, phone },
  });

  if (req.user!.role === 'COMPANY' && (companyName || taxNumber || address)) {
    await prisma.companyProfile.update({
      where: { userId },
      data: { companyName, taxNumber, address },
    });
  }

  if (req.user!.role === 'INVESTOR' && bankIban) {
    await prisma.investorProfile.update({
      where: { userId },
      data: { bankIban },
    });
  }

  res.json({ message: 'Profil güncellendi' });
}
