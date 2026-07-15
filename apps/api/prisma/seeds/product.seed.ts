import type { PrismaClient } from '../../generated/prisma/client';

interface ProductSeed {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  basePrice: number;
  salePrice: number | null;
  categorySlug: string;
  brandSlug: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  stock: number;
  material: string;
  weight: string;
  careInstructions: string;
  tags: string[];
  images: { url: string; alt: string; isPrimary: boolean }[];
  variants: { size: string; color: string; colorCode: string; sku: string; price: number; stock: number }[];
}

const products: ProductSeed[] = [
  // ── Shirts ──────────────────────────
  {
    name: 'Royal Oxford Classic Shirt',
    slug: 'royal-oxford-classic-shirt',
    description: 'A timeless Oxford shirt crafted from premium 100% Egyptian cotton. Features a button-down collar, single chest pocket, and mother-of-pearl buttons. Perfect for both formal and smart casual occasions.',
    shortDescription: 'Premium Egyptian cotton Oxford shirt',
    sku: 'KES-SH-001',
    basePrice: 2499,
    salePrice: 1999,
    categorySlug: 'shirts',
    brandSlug: 'kesariya-originals',
    isFeatured: true,
    isNewArrival: false,
    stock: 120,
    material: '100% Egyptian Cotton',
    weight: '220g',
    careInstructions: 'Machine wash cold. Tumble dry low. Iron on medium heat.',
    tags: ['formal', 'oxford', 'cotton', 'classic'],
    images: [
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', alt: 'Royal Oxford Classic Shirt - Front', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=800', alt: 'Royal Oxford Classic Shirt - Side', isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', alt: 'Royal Oxford Classic Shirt - Detail', isPrimary: false },
    ],
    variants: [
      { size: 'S', color: 'White', colorCode: '#FFFFFF', sku: 'KES-SH-001-S-WH', price: 1999, stock: 20 },
      { size: 'M', color: 'White', colorCode: '#FFFFFF', sku: 'KES-SH-001-M-WH', price: 1999, stock: 30 },
      { size: 'L', color: 'White', colorCode: '#FFFFFF', sku: 'KES-SH-001-L-WH', price: 1999, stock: 25 },
      { size: 'XL', color: 'White', colorCode: '#FFFFFF', sku: 'KES-SH-001-XL-WH', price: 1999, stock: 15 },
      { size: 'M', color: 'Sky Blue', colorCode: '#87CEEB', sku: 'KES-SH-001-M-SB', price: 1999, stock: 20 },
      { size: 'L', color: 'Sky Blue', colorCode: '#87CEEB', sku: 'KES-SH-001-L-SB', price: 1999, stock: 15 },
    ],
  },
  {
    name: 'Midnight Linen Mandarin Shirt',
    slug: 'midnight-linen-mandarin-shirt',
    description: 'A sophisticated linen shirt featuring a mandarin collar and clean lines. The breathable fabric makes it ideal for warm weather, while the elegant design transitions seamlessly from day to evening.',
    shortDescription: 'Breathable linen mandarin collar shirt',
    sku: 'KES-SH-002',
    basePrice: 2999,
    salePrice: null,
    categorySlug: 'shirts',
    brandSlug: 'heritage-weave',
    isFeatured: true,
    isNewArrival: true,
    stock: 80,
    material: '100% Pure Linen',
    weight: '180g',
    careInstructions: 'Hand wash recommended. Dry in shade. Iron on low heat.',
    tags: ['linen', 'mandarin', 'summer', 'premium'],
    images: [
      { url: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800', alt: 'Midnight Linen Mandarin Shirt - Front', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', alt: 'Midnight Linen Mandarin Shirt - Side', isPrimary: false },
    ],
    variants: [
      { size: 'S', color: 'Navy', colorCode: '#1B2A4A', sku: 'KES-SH-002-S-NV', price: 2999, stock: 15 },
      { size: 'M', color: 'Navy', colorCode: '#1B2A4A', sku: 'KES-SH-002-M-NV', price: 2999, stock: 25 },
      { size: 'L', color: 'Navy', colorCode: '#1B2A4A', sku: 'KES-SH-002-L-NV', price: 2999, stock: 20 },
      { size: 'XL', color: 'Navy', colorCode: '#1B2A4A', sku: 'KES-SH-002-XL-NV', price: 2999, stock: 10 },
      { size: 'M', color: 'Olive', colorCode: '#556B2F', sku: 'KES-SH-002-M-OL', price: 2999, stock: 10 },
    ],
  },
  {
    name: 'Saffron Stripe Casual Shirt',
    slug: 'saffron-stripe-casual-shirt',
    description: 'A vibrant casual shirt with Kesariya signature saffron stripes. Made from soft cotton blend for all-day comfort. Features a spread collar and adjustable cuffs.',
    shortDescription: 'Casual cotton shirt with saffron stripes',
    sku: 'KES-SH-003',
    basePrice: 1799,
    salePrice: 999,
    categorySlug: 'shirts',
    brandSlug: 'kesariya-originals',
    isFeatured: false,
    isNewArrival: false,
    stock: 150,
    material: 'Cotton Blend (80% Cotton, 20% Polyester)',
    weight: '200g',
    careInstructions: 'Machine wash cold. Do not bleach. Iron on medium.',
    tags: ['casual', 'stripes', 'cotton', 'summer'],
    images: [
      { url: 'https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=800', alt: 'Saffron Stripe Shirt - Front', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800', alt: 'Saffron Stripe Shirt - Detail', isPrimary: false },
    ],
    variants: [
      { size: 'S', color: 'Saffron', colorCode: '#F4C430', sku: 'KES-SH-003-S-SF', price: 999, stock: 30 },
      { size: 'M', color: 'Saffron', colorCode: '#F4C430', sku: 'KES-SH-003-M-SF', price: 999, stock: 40 },
      { size: 'L', color: 'Saffron', colorCode: '#F4C430', sku: 'KES-SH-003-L-SF', price: 999, stock: 35 },
      { size: 'XL', color: 'Saffron', colorCode: '#F4C430', sku: 'KES-SH-003-XL-SF', price: 999, stock: 25 },
      { size: 'XXL', color: 'Saffron', colorCode: '#F4C430', sku: 'KES-SH-003-XXL-SF', price: 999, stock: 20 },
    ],
  },

  // ── T-Shirts ──────────────────────────
  {
    name: 'Heritage Block Print Tee',
    slug: 'heritage-block-print-tee',
    description: 'A unique t-shirt featuring hand-inspired block print motifs from Rajasthan. Made from premium organic cotton for a soft, comfortable feel.',
    shortDescription: 'Organic cotton tee with block print design',
    sku: 'KES-TS-001',
    basePrice: 1299,
    salePrice: null,
    categorySlug: 't-shirts',
    brandSlug: 'heritage-weave',
    isFeatured: true,
    isNewArrival: true,
    stock: 200,
    material: '100% Organic Cotton',
    weight: '160g',
    careInstructions: 'Machine wash cold. Do not wring. Dry in shade.',
    tags: ['organic', 'block-print', 'ethnic', 'casual'],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', alt: 'Heritage Block Print Tee - Front', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', alt: 'Heritage Block Print Tee - Back', isPrimary: false },
    ],
    variants: [
      { size: 'S', color: 'Cream', colorCode: '#FFFDD0', sku: 'KES-TS-001-S-CR', price: 1299, stock: 40 },
      { size: 'M', color: 'Cream', colorCode: '#FFFDD0', sku: 'KES-TS-001-M-CR', price: 1299, stock: 50 },
      { size: 'L', color: 'Cream', colorCode: '#FFFDD0', sku: 'KES-TS-001-L-CR', price: 1299, stock: 45 },
      { size: 'XL', color: 'Cream', colorCode: '#FFFDD0', sku: 'KES-TS-001-XL-CR', price: 1299, stock: 35 },
      { size: 'M', color: 'Charcoal', colorCode: '#36454F', sku: 'KES-TS-001-M-CH', price: 1299, stock: 30 },
    ],
  },
  {
    name: 'Minimal Crew Neck Tee',
    slug: 'minimal-crew-neck-tee',
    description: 'The perfect everyday t-shirt. Clean lines, premium cotton, and a relaxed fit that flatters every body type.',
    shortDescription: 'Essential everyday crew neck t-shirt',
    sku: 'KES-TS-002',
    basePrice: 899,
    salePrice: 599,
    categorySlug: 't-shirts',
    brandSlug: 'aurastitch',
    isFeatured: false,
    isNewArrival: false,
    stock: 300,
    material: '100% Supima Cotton',
    weight: '150g',
    careInstructions: 'Machine wash cold. Tumble dry low.',
    tags: ['minimal', 'everyday', 'crew-neck', 'basic'],
    images: [
      { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800', alt: 'Minimal Crew Neck Tee - Front', isPrimary: true },
    ],
    variants: [
      { size: 'S', color: 'Black', colorCode: '#000000', sku: 'KES-TS-002-S-BK', price: 599, stock: 50 },
      { size: 'M', color: 'Black', colorCode: '#000000', sku: 'KES-TS-002-M-BK', price: 599, stock: 60 },
      { size: 'L', color: 'Black', colorCode: '#000000', sku: 'KES-TS-002-L-BK', price: 599, stock: 50 },
      { size: 'XL', color: 'Black', colorCode: '#000000', sku: 'KES-TS-002-XL-BK', price: 599, stock: 40 },
      { size: 'M', color: 'White', colorCode: '#FFFFFF', sku: 'KES-TS-002-M-WH', price: 599, stock: 50 },
      { size: 'L', color: 'White', colorCode: '#FFFFFF', sku: 'KES-TS-002-L-WH', price: 599, stock: 50 },
    ],
  },

  // ── Kurtas ──────────────────────────
  {
    name: 'Royal Silk Sherwani Kurta',
    slug: 'royal-silk-sherwani-kurta',
    description: 'An exquisite silk kurta with intricate embroidery work. The sherwani-style collar adds a regal touch, perfect for weddings and festive celebrations.',
    shortDescription: 'Embroidered silk kurta for special occasions',
    sku: 'KES-KR-001',
    basePrice: 6999,
    salePrice: 4999,
    categorySlug: 'kurtas',
    brandSlug: 'mahal',
    isFeatured: true,
    isNewArrival: false,
    stock: 30,
    material: '100% Pure Silk with Zari Embroidery',
    weight: '350g',
    careInstructions: 'Dry clean only. Store in garment bag.',
    tags: ['silk', 'wedding', 'embroidery', 'festive', 'luxury'],
    images: [
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', alt: 'Royal Silk Sherwani Kurta - Front', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', alt: 'Royal Silk Sherwani Kurta - Detail', isPrimary: false },
    ],
    variants: [
      { size: 'S', color: 'Gold', colorCode: '#D4AF37', sku: 'KES-KR-001-S-GD', price: 4999, stock: 5 },
      { size: 'M', color: 'Gold', colorCode: '#D4AF37', sku: 'KES-KR-001-M-GD', price: 4999, stock: 10 },
      { size: 'L', color: 'Gold', colorCode: '#D4AF37', sku: 'KES-KR-001-L-GD', price: 4999, stock: 8 },
      { size: 'XL', color: 'Gold', colorCode: '#D4AF37', sku: 'KES-KR-001-XL-GD', price: 4999, stock: 5 },
      { size: 'M', color: 'Maroon', colorCode: '#800000', sku: 'KES-KR-001-M-MR', price: 4999, stock: 2 },
    ],
  },
  {
    name: 'Cotton Lucknowi Chikan Kurta',
    slug: 'cotton-lucknowi-chikan-kurta',
    description: 'A lightweight cotton kurta featuring the famous Lucknowi Chikan embroidery. The hand-stitched motifs and breathable fabric make it perfect for summer festivities.',
    shortDescription: 'Handcrafted Lucknowi Chikan embroidered kurta',
    sku: 'KES-KR-002',
    basePrice: 3499,
    salePrice: null,
    categorySlug: 'kurtas',
    brandSlug: 'heritage-weave',
    isFeatured: false,
    isNewArrival: true,
    stock: 60,
    material: '100% Handloom Cotton',
    weight: '250g',
    careInstructions: 'Hand wash in cold water. Dry in shade. Light press.',
    tags: ['chikan', 'lucknowi', 'handmade', 'cotton', 'ethnic'],
    images: [
      { url: 'https://images.unsplash.com/photo-1594938328870-9623159c8c99?w=800', alt: 'Lucknowi Chikan Kurta - Front', isPrimary: true },
    ],
    variants: [
      { size: 'S', color: 'White', colorCode: '#FFFFFF', sku: 'KES-KR-002-S-WH', price: 3499, stock: 10 },
      { size: 'M', color: 'White', colorCode: '#FFFFFF', sku: 'KES-KR-002-M-WH', price: 3499, stock: 20 },
      { size: 'L', color: 'White', colorCode: '#FFFFFF', sku: 'KES-KR-002-L-WH', price: 3499, stock: 15 },
      { size: 'XL', color: 'White', colorCode: '#FFFFFF', sku: 'KES-KR-002-XL-WH', price: 3499, stock: 10 },
      { size: 'L', color: 'Pastel Yellow', colorCode: '#FDFD96', sku: 'KES-KR-002-L-PY', price: 3499, stock: 5 },
    ],
  },

  // ── Trousers ──────────────────────────
  {
    name: 'Italian Wool Blend Trousers',
    slug: 'italian-wool-blend-trousers',
    description: 'Impeccably tailored trousers from an Italian wool blend. Features a flat front, sharp crease, and a modern slim fit. The perfect companion for formal shirts.',
    shortDescription: 'Slim-fit Italian wool blend formal trousers',
    sku: 'KES-TR-001',
    basePrice: 3999,
    salePrice: 2799,
    categorySlug: 'trousers',
    brandSlug: 'threadcraft',
    isFeatured: true,
    isNewArrival: false,
    stock: 70,
    material: 'Wool Blend (60% Wool, 40% Polyester)',
    weight: '400g',
    careInstructions: 'Dry clean recommended. Iron on medium-high heat.',
    tags: ['formal', 'wool', 'italian', 'slim-fit', 'office'],
    images: [
      { url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800', alt: 'Italian Wool Blend Trousers - Front', isPrimary: true },
    ],
    variants: [
      { size: '28', color: 'Charcoal', colorCode: '#36454F', sku: 'KES-TR-001-28-CH', price: 2799, stock: 10 },
      { size: '30', color: 'Charcoal', colorCode: '#36454F', sku: 'KES-TR-001-30-CH', price: 2799, stock: 15 },
      { size: '32', color: 'Charcoal', colorCode: '#36454F', sku: 'KES-TR-001-32-CH', price: 2799, stock: 15 },
      { size: '34', color: 'Charcoal', colorCode: '#36454F', sku: 'KES-TR-001-34-CH', price: 2799, stock: 10 },
      { size: '36', color: 'Charcoal', colorCode: '#36454F', sku: 'KES-TR-001-36-CH', price: 2799, stock: 10 },
      { size: '32', color: 'Navy', colorCode: '#1B2A4A', sku: 'KES-TR-001-32-NV', price: 2799, stock: 10 },
    ],
  },
  {
    name: 'Cotton Chino Pants',
    slug: 'cotton-chino-pants',
    description: 'Versatile cotton chinos with a comfortable relaxed fit. Perfect for weekends, casual Fridays, or date nights.',
    shortDescription: 'Relaxed fit cotton chino pants',
    sku: 'KES-TR-002',
    basePrice: 1999,
    salePrice: null,
    categorySlug: 'trousers',
    brandSlug: 'aurastitch',
    isFeatured: false,
    isNewArrival: true,
    stock: 100,
    material: '98% Cotton, 2% Elastane',
    weight: '320g',
    careInstructions: 'Machine wash cold. Tumble dry low. Iron on medium.',
    tags: ['chinos', 'casual', 'cotton', 'weekend'],
    images: [
      { url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800', alt: 'Cotton Chino Pants - Front', isPrimary: true },
    ],
    variants: [
      { size: '28', color: 'Khaki', colorCode: '#C3B091', sku: 'KES-TR-002-28-KH', price: 1999, stock: 15 },
      { size: '30', color: 'Khaki', colorCode: '#C3B091', sku: 'KES-TR-002-30-KH', price: 1999, stock: 20 },
      { size: '32', color: 'Khaki', colorCode: '#C3B091', sku: 'KES-TR-002-32-KH', price: 1999, stock: 25 },
      { size: '34', color: 'Khaki', colorCode: '#C3B091', sku: 'KES-TR-002-34-KH', price: 1999, stock: 20 },
      { size: '30', color: 'Olive', colorCode: '#556B2F', sku: 'KES-TR-002-30-OL', price: 1999, stock: 10 },
      { size: '32', color: 'Olive', colorCode: '#556B2F', sku: 'KES-TR-002-32-OL', price: 1999, stock: 10 },
    ],
  },

  // ── Ethnic Wear ──────────────────────────
  {
    name: 'Festive Nehru Jacket Set',
    slug: 'festive-nehru-jacket-set',
    description: 'A stunning Nehru jacket paired with a matching kurta. The jacket features intricate brocade work with gold thread detailing, ideal for weddings and festivals.',
    shortDescription: 'Brocade Nehru jacket with matching kurta',
    sku: 'KES-EW-001',
    basePrice: 8999,
    salePrice: 5999,
    categorySlug: 'ethnic-wear',
    brandSlug: 'mahal',
    isFeatured: true,
    isNewArrival: true,
    stock: 20,
    material: 'Brocade with Gold Zari',
    weight: '600g',
    careInstructions: 'Dry clean only. Store flat in garment bag.',
    tags: ['wedding', 'nehru-jacket', 'festive', 'luxury', 'set'],
    images: [
      { url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', alt: 'Nehru Jacket Set - Full', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', alt: 'Nehru Jacket Set - Detail', isPrimary: false },
    ],
    variants: [
      { size: 'S', color: 'Royal Blue', colorCode: '#002366', sku: 'KES-EW-001-S-RB', price: 5999, stock: 3 },
      { size: 'M', color: 'Royal Blue', colorCode: '#002366', sku: 'KES-EW-001-M-RB', price: 5999, stock: 7 },
      { size: 'L', color: 'Royal Blue', colorCode: '#002366', sku: 'KES-EW-001-L-RB', price: 5999, stock: 5 },
      { size: 'XL', color: 'Royal Blue', colorCode: '#002366', sku: 'KES-EW-001-XL-RB', price: 5999, stock: 3 },
      { size: 'M', color: 'Wine', colorCode: '#722F37', sku: 'KES-EW-001-M-WN', price: 5999, stock: 2 },
    ],
  },

  // ── Accessories ──────────────────────────
  {
    name: 'Handwoven Silk Pocket Square',
    slug: 'handwoven-silk-pocket-square',
    description: 'A luxurious handwoven silk pocket square featuring traditional paisley motifs. Adds the perfect finishing touch to any blazer or jacket.',
    shortDescription: 'Handwoven silk pocket square with paisley motifs',
    sku: 'KES-AC-001',
    basePrice: 799,
    salePrice: null,
    categorySlug: 'accessories',
    brandSlug: 'heritage-weave',
    isFeatured: false,
    isNewArrival: true,
    stock: 200,
    material: '100% Mulberry Silk',
    weight: '30g',
    careInstructions: 'Dry clean only.',
    tags: ['silk', 'pocket-square', 'accessories', 'handwoven'],
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', alt: 'Silk Pocket Square - Flat', isPrimary: true },
    ],
    variants: [
      { size: 'One Size', color: 'Burgundy', colorCode: '#800020', sku: 'KES-AC-001-OS-BG', price: 799, stock: 50 },
      { size: 'One Size', color: 'Navy', colorCode: '#1B2A4A', sku: 'KES-AC-001-OS-NV', price: 799, stock: 50 },
      { size: 'One Size', color: 'Gold', colorCode: '#D4AF37', sku: 'KES-AC-001-OS-GD', price: 799, stock: 50 },
      { size: 'One Size', color: 'Teal', colorCode: '#008080', sku: 'KES-AC-001-OS-TL', price: 799, stock: 50 },
    ],
  },
  {
    name: 'Artisan Leather Belt',
    slug: 'artisan-leather-belt',
    description: 'A premium full-grain leather belt with a hand-finished antique brass buckle. The vegetable-tanned leather develops a beautiful patina over time.',
    shortDescription: 'Full-grain leather belt with brass buckle',
    sku: 'KES-AC-002',
    basePrice: 1499,
    salePrice: 1199,
    categorySlug: 'accessories',
    brandSlug: 'threadcraft',
    isFeatured: true,
    isNewArrival: false,
    stock: 80,
    material: 'Full-Grain Vegetable-Tanned Leather',
    weight: '180g',
    careInstructions: 'Wipe with damp cloth. Apply leather conditioner monthly.',
    tags: ['leather', 'belt', 'accessories', 'premium'],
    images: [
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', alt: 'Artisan Leather Belt', isPrimary: true },
    ],
    variants: [
      { size: '30', color: 'Tan', colorCode: '#D2B48C', sku: 'KES-AC-002-30-TN', price: 1199, stock: 15 },
      { size: '32', color: 'Tan', colorCode: '#D2B48C', sku: 'KES-AC-002-32-TN', price: 1199, stock: 20 },
      { size: '34', color: 'Tan', colorCode: '#D2B48C', sku: 'KES-AC-002-34-TN', price: 1199, stock: 15 },
      { size: '36', color: 'Tan', colorCode: '#D2B48C', sku: 'KES-AC-002-36-TN', price: 1199, stock: 10 },
      { size: '32', color: 'Dark Brown', colorCode: '#3B2820', sku: 'KES-AC-002-32-DB', price: 1199, stock: 10 },
      { size: '34', color: 'Dark Brown', colorCode: '#3B2820', sku: 'KES-AC-002-34-DB', price: 1199, stock: 10 },
    ],
  },
];

export async function seedProducts(prisma: PrismaClient) {
  console.log('🌱 Seeding Products...');

  for (const product of products) {
    // Find category and brand
    const category = await prisma.category.findUnique({
      where: { slug: product.categorySlug },
    });

    const brand = await prisma.brand.findUnique({
      where: { slug: product.brandSlug },
    });

    if (!category) {
      console.warn(`⚠️ Category "${product.categorySlug}" not found. Skipping "${product.name}".`);
      continue;
    }

    // Upsert product
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        stock: product.stock,
        material: product.material,
        weight: product.weight,
        careInstructions: product.careInstructions,
        tags: product.tags,
        status: 'ACTIVE',
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        categoryId: category.id,
        brandId: brand?.id,
        isFeatured: product.isFeatured,
        isNewArrival: product.isNewArrival,
        stock: product.stock,
        status: 'ACTIVE',
        material: product.material,
        weight: product.weight,
        careInstructions: product.careInstructions,
        tags: product.tags,
      },
    });

    // Seed images (delete existing and recreate)
    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    for (let i = 0; i < product.images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: product.images[i].url,
          alt: product.images[i].alt,
          isPrimary: product.images[i].isPrimary,
          sortOrder: i,
        },
      });
    }

    // Seed variants (upsert by sku)
    for (let i = 0; i < product.variants.length; i++) {
      const v = product.variants[i];
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          price: v.price,
          stock: v.stock,
          sortOrder: i,
        },
        create: {
          productId: created.id,
          size: v.size,
          color: v.color,
          colorCode: v.colorCode,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          sortOrder: i,
        },
      });
    }
  }

  console.log(`✅ ${products.length} Products Seeded`);
}
