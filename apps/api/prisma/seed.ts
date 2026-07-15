import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { seedRoles } from './seeds/role.seed';
import { seedCategories } from './seeds/category.seed';
import { seedBrands } from './seeds/brand.seed';
import { seedProducts } from './seeds/product.seed';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Database Seeding Started...\n');

  await seedRoles(prisma);
  await seedCategories(prisma);
  await seedBrands(prisma);
  await seedProducts(prisma);

  console.log('\n🎉 Database Seeding Completed');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

