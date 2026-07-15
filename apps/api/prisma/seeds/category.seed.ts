import type { PrismaClient } from '../../generated/prisma/client';

const categories = [
  {
    name: 'Shirts',
    slug: 'shirts',
    description: 'Premium handcrafted shirts for every occasion',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    sortOrder: 1,
  },
  {
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'Comfortable and stylish t-shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    sortOrder: 2,
  },
  {
    name: 'Kurtas',
    slug: 'kurtas',
    description: 'Traditional kurtas with modern flair',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600',
    sortOrder: 3,
  },
  {
    name: 'Trousers',
    slug: 'trousers',
    description: 'Tailored trousers for the modern gentleman',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600',
    sortOrder: 4,
  },
  {
    name: 'Ethnic Wear',
    slug: 'ethnic-wear',
    description: 'Complete ethnic outfits for festivals and celebrations',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
    sortOrder: 5,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complement your outfit with premium accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    sortOrder: 6,
  },
];

export async function seedCategories(prisma: PrismaClient) {
  console.log('🌱 Seeding Categories...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        image: category.image,
        sortOrder: category.sortOrder,
      },
      create: {
        ...category,
        isActive: true,
      },
    });
  }

  console.log('✅ Categories Seeded');
}
