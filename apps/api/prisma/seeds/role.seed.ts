import type { PrismaClient } from '../../generated/prisma/client';

const roles = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'System Owner',
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Store Administrator',
  },
  {
    name: 'Customer',
    slug: 'customer',
    description: 'Customer',
  },
];

export async function seedRoles(prisma: PrismaClient) {
  console.log('🌱 Seeding Roles...');

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        slug: role.slug,
      },
      update: {
        name: role.name,
        description: role.description,
        isActive: true,
      },
      create: {
        ...role,
        isActive: true,
      },
    });
  }

  console.log('✅ Roles Seeded');
}
