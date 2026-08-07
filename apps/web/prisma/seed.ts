import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Supabase database...");

  // 1. Roles
  const superAdminRole = await prisma.role.upsert({
    where: { slug: "super-admin" },
    update: {},
    create: {
      name: "Super Admin",
      slug: "super-admin",
      description: "Full system administration access",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: "admin" },
    update: {},
    create: {
      name: "Admin",
      slug: "admin",
      description: "Store management access",
    },
  });

  await prisma.role.upsert({
    where: { slug: "customer" },
    update: {},
    create: {
      name: "Customer",
      slug: "customer",
      description: "Standard customer role",
    },
  });

  // 2. Default Super Admin User
  const passwordHash = await bcrypt.hash("Admin@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@kesariya.com" },
    update: { roleId: superAdminRole.id },
    create: {
      firstName: "Kesariya",
      lastName: "Admin",
      email: "admin@kesariya.com",
      mobile: "9999999999",
      countryCode: "+91",
      password: passwordHash,
      isVerified: true,
      roleId: superAdminRole.id,
    },
  });

  // 3. Default Store Settings
  const defaultSettings = [
    {
      key: "general",
      value: {
        storeName: "Kesariya",
        storeEmail: "support@kesariya.com",
        supportPhone: "+91 98765 43210",
        currency: "INR",
        currencySymbol: "₹",
        maintenanceMode: false,
      },
    },
    {
      key: "shipping",
      value: {
        flatShippingFee: 99,
        freeShippingThreshold: 1999,
        codEnabled: true,
      },
    },
    {
      key: "tax",
      value: {
        apparelGstRate: 12,
        pricesIncludeGst: true,
      },
    },
  ];

  for (const s of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // 4. Default Categories
  const categories = [
    { name: "Linen Shirts", slug: "linen-shirts", description: "Pure handcrafted linen shirts for men", sortOrder: 1 },
    { name: "Hand-Block Print", slug: "hand-block-print", description: "Traditional Jaipur hand-block printed apparel", sortOrder: 2 },
    { name: "Cotton Casuals", slug: "cotton-casuals", description: "Breathable organic cotton everyday wear", sortOrder: 3 },
    { name: "Ethnic Kurtas", slug: "ethnic-kurtas", description: "Festive and wedding ethnic wear", sortOrder: 4 },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, isActive: true },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
