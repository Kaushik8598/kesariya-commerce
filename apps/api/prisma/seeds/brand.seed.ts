import type { PrismaClient } from '../../generated/prisma/client';

const brands = [
  {
    name: 'Kesariya Originals',
    slug: 'kesariya-originals',
    description: 'Our signature in-house collection — crafted with love',
    logo: null,
  },
  {
    name: 'Heritage Weave',
    slug: 'heritage-weave',
    description: 'Traditional craftsmanship meets contemporary design',
    logo: null,
  },
  {
    name: 'Mahal',
    slug: 'mahal',
    description: 'Luxury ethnic wear for special occasions',
    logo: null,
  },
  {
    name: 'ThreadCraft',
    slug: 'threadcraft',
    description: 'Premium casual wear for everyday comfort',
    logo: null,
  },
  {
    name: 'AuraStitch',
    slug: 'aurastitch',
    description: 'Modern minimalist fashion',
    logo: null,
  },
];

export async function seedBrands(prisma: PrismaClient) {
  console.log('🌱 Seeding Brands...');

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description,
      },
      create: {
        ...brand,
        isActive: true,
      },
    });
  }

  console.log('✅ Brands Seeded');
}
