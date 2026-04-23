import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Demo Company
  const company = await prisma.user.upsert({
    where: { email: 'firma@demo.com' },
    update: {},
    create: {
      email: 'firma@demo.com',
      password: hash('demo1234'),
      name: 'Demo Ticari Firma',
      phone: '05001234567',
      role: 'COMPANY',
      companyProfile: {
        create: {
          companyName: 'TechMart A.Ş.',
          taxNumber: '1234567890',
          address: 'İstanbul, Türkiye',
          sellerId: 'SELLER001',
          apiKey: 'demo-api-key-123',
        },
      },
    },
    include: { companyProfile: true },
  });

  // Demo Investor
  const investor = await prisma.user.upsert({
    where: { email: 'yatirimci@demo.com' },
    update: {},
    create: {
      email: 'yatirimci@demo.com',
      password: hash('demo1234'),
      name: 'Ali Yılmaz',
      phone: '05321234567',
      role: 'INVESTOR',
      investorProfile: {
        create: {
          idNumber: '12345678901',
          bankIban: 'TR123456789012345678901234',
        },
      },
    },
  });

  // Demo Products
  const companyProfile = company.companyProfile!;
  const products = [
    {
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Elektronik',
      stockCount: 50,
      profitRate: 12.5,
      termDays: 30,
      salesLink: 'https://trendyol.com/samsung-s24',
      targetAmount: 50000,
      status: 'OPEN',
      verifiedAt: new Date(),
    },
    {
      name: 'Nike Air Max 2024 Koleksiyonu',
      category: 'Tekstil',
      stockCount: 200,
      profitRate: 18,
      termDays: 45,
      salesLink: 'https://trendyol.com/nike-air-max',
      targetAmount: 30000,
      currentAmount: 12000,
      status: 'OPEN',
      verifiedAt: new Date(),
    },
    {
      name: 'Bosch Bulaşık Makinesi SMS4HTI33T',
      category: 'Ev Eşyası',
      stockCount: 30,
      profitRate: 15,
      termDays: 60,
      salesLink: 'https://trendyol.com/bosch-bulasik',
      targetAmount: 75000,
      currentAmount: 75000,
      status: 'FUNDED',
      verifiedAt: new Date(),
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: `seed-${p.name.slice(0, 8)}` },
      update: {},
      create: {
        id: `seed-${p.name.slice(0, 8)}`,
        companyId: companyProfile.id,
        ...p,
      },
    });
  }

  console.log('Seed tamamlandı.');
  console.log('Firma: firma@demo.com / demo1234');
  console.log('Yatırımcı: yatirimci@demo.com / demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
