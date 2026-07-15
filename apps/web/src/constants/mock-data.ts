// ─── Types ─────────────────────────────────────────────────────────────

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
  description: string;
}

export interface MockProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  basePrice: number;
  salePrice: number | null;
  rating: number;
  reviewCount: number;
  category: string;
  badge?: string;
}

export interface MockTestimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  initials: string;
  product: string;
}

export interface MockOffer {
  id: string;
  title: string;
  subtitle: string;
  discount: string;
  code: string;
  endsAt: string;
}

// ─── Categories ────────────────────────────────────────────────────────

export const categories: MockCategory[] = [
  {
    id: "1",
    name: "Shirts",
    slug: "shirts",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop",
    productCount: 48,
    description: "Premium Cotton & Linen",
  },
  {
    id: "2",
    name: "Kurtas",
    slug: "kurtas",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop",
    productCount: 36,
    description: "Handcrafted Ethnic Wear",
  },
  {
    id: "3",
    name: "T-Shirts",
    slug: "t-shirts",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
    productCount: 52,
    description: "Casual Comfort",
  },
  {
    id: "4",
    name: "Trousers",
    slug: "trousers",
    image:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&h=600&fit=crop",
    productCount: 29,
    description: "Tailored Fits",
  },
  {
    id: "5",
    name: "Ethnic Wear",
    slug: "ethnic-wear",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=600&fit=crop",
    productCount: 41,
    description: "Traditional Attire",
  },
  {
    id: "6",
    name: "Accessories",
    slug: "accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop",
    productCount: 18,
    description: "Complete Your Look",
  },
];

// ─── Featured Products ─────────────────────────────────────────────────

export const featuredProducts: MockProduct[] = [
  {
    id: "1",
    name: "Mandarin Collar Cotton Shirt",
    slug: "mandarin-collar-cotton-shirt",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=520&fit=crop",
    basePrice: 2499,
    salePrice: 999,
    rating: 4.5,
    reviewCount: 128,
    category: "Shirts",
    badge: "BESTSELLER",
  },
  {
    id: "2",
    name: "Block Print Linen Shirt",
    slug: "block-print-linen-shirt",
    image:
      "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&h=520&fit=crop",
    basePrice: 2999,
    salePrice: 1499,
    rating: 4.7,
    reviewCount: 89,
    category: "Shirts",
    badge: "60% OFF",
  },
  {
    id: "3",
    name: "Classic Indigo Kurta",
    slug: "classic-indigo-kurta",
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=520&fit=crop",
    basePrice: 3499,
    salePrice: 1799,
    rating: 4.8,
    reviewCount: 204,
    category: "Kurtas",
  },
  {
    id: "4",
    name: "Premium Organic Cotton Tee",
    slug: "premium-organic-cotton-tee",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=520&fit=crop",
    basePrice: 1299,
    salePrice: 699,
    rating: 4.3,
    reviewCount: 312,
    category: "T-Shirts",
  },
  {
    id: "5",
    name: "Handwoven Silk Kurta Set",
    slug: "handwoven-silk-kurta-set",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=520&fit=crop",
    basePrice: 5999,
    salePrice: 3499,
    rating: 4.9,
    reviewCount: 67,
    category: "Ethnic Wear",
    badge: "PREMIUM",
  },
  {
    id: "6",
    name: "Slim Fit Tailored Chinos",
    slug: "slim-fit-tailored-chinos",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=520&fit=crop",
    basePrice: 2199,
    salePrice: null,
    rating: 4.4,
    reviewCount: 156,
    category: "Trousers",
  },
  {
    id: "7",
    name: "Striped Oxford Shirt",
    slug: "striped-oxford-shirt",
    image:
      "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=400&h=520&fit=crop",
    basePrice: 2799,
    salePrice: 1399,
    rating: 4.6,
    reviewCount: 93,
    category: "Shirts",
    badge: "50% OFF",
  },
  {
    id: "8",
    name: "Casual Henley T-Shirt",
    slug: "casual-henley-tshirt",
    image:
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=520&fit=crop",
    basePrice: 1499,
    salePrice: 899,
    rating: 4.2,
    reviewCount: 245,
    category: "T-Shirts",
  },
];

// ─── New Arrivals ──────────────────────────────────────────────────────

export const newArrivals: MockProduct[] = [
  {
    id: "9",
    name: "Summer Breeze Linen Shirt",
    slug: "summer-breeze-linen-shirt",
    image:
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&h=520&fit=crop",
    basePrice: 3299,
    salePrice: 2299,
    rating: 4.6,
    reviewCount: 12,
    category: "Shirts",
    badge: "NEW",
  },
  {
    id: "10",
    name: "Textured Polo T-Shirt",
    slug: "textured-polo-tshirt",
    image:
      "https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?w=400&h=520&fit=crop",
    basePrice: 1799,
    salePrice: null,
    rating: 4.5,
    reviewCount: 8,
    category: "T-Shirts",
    badge: "NEW",
  },
  {
    id: "11",
    name: "Embroidered Festival Kurta",
    slug: "embroidered-festival-kurta",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=520&fit=crop",
    basePrice: 4499,
    salePrice: 3199,
    rating: 4.9,
    reviewCount: 5,
    category: "Ethnic Wear",
    badge: "NEW",
  },
  {
    id: "12",
    name: "Relaxed Fit Cotton Trousers",
    slug: "relaxed-fit-cotton-trousers",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=520&fit=crop",
    basePrice: 2499,
    salePrice: 1899,
    rating: 4.4,
    reviewCount: 15,
    category: "Trousers",
    badge: "NEW",
  },
  {
    id: "13",
    name: "Washed Denim Shirt",
    slug: "washed-denim-shirt",
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=520&fit=crop",
    basePrice: 2999,
    salePrice: null,
    rating: 4.7,
    reviewCount: 3,
    category: "Shirts",
    badge: "NEW",
  },
  {
    id: "14",
    name: "Minimalist Leather Belt",
    slug: "minimalist-leather-belt",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=520&fit=crop",
    basePrice: 1299,
    salePrice: 999,
    rating: 4.3,
    reviewCount: 22,
    category: "Accessories",
    badge: "NEW",
  },
];

// ─── Testimonials ──────────────────────────────────────────────────────

export const testimonials: MockTestimonial[] = [
  {
    id: "1",
    name: "Rajesh Patel",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    comment:
      "The quality of Kesariya shirts is unmatched. The fabric feels premium and the fit is perfect. Bought 5 shirts already — each one exceeded my expectations!",
    initials: "RP",
    product: "Mandarin Collar Cotton Shirt",
  },
  {
    id: "2",
    name: "Ananya Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    comment:
      "Gifted a Kesariya kurta set to my husband for Diwali. The craftsmanship is outstanding and the packaging felt so luxurious. Will definitely order again.",
    initials: "AS",
    product: "Handwoven Silk Kurta Set",
  },
  {
    id: "3",
    name: "Vikram Singh",
    location: "Jaipur, Rajasthan",
    rating: 4,
    comment:
      "Love the block print collection! The designs are unique and the linen fabric is perfect for Rajasthan's summers. Great value for the quality offered.",
    initials: "VS",
    product: "Block Print Linen Shirt",
  },
  {
    id: "4",
    name: "Priya Desai",
    location: "Bangalore, Karnataka",
    rating: 5,
    comment:
      "Fast delivery and the shirt looked exactly like the pictures. The attention to detail in the stitching and button quality is impressive. Premium feel at affordable prices.",
    initials: "PD",
    product: "Striped Oxford Shirt",
  },
  {
    id: "5",
    name: "Karan Mehta",
    location: "Delhi, NCR",
    rating: 5,
    comment:
      "Been shopping from Kesariya for 2 years now. Their consistency in quality is remarkable. The new measurements feature is a game-changer for online shopping!",
    initials: "KM",
    product: "Summer Breeze Linen Shirt",
  },
  {
    id: "6",
    name: "Sneha Reddy",
    location: "Hyderabad, Telangana",
    rating: 4,
    comment:
      "The ethnic wear collection is beautifully curated. Ordered the festival kurta for my brother — the embroidery work is exquisite. Highly recommend Kesariya!",
    initials: "SR",
    product: "Embroidered Festival Kurta",
  },
];

// ─── Offers ────────────────────────────────────────────────────────────

export const offers: MockOffer[] = [
  {
    id: "1",
    title: "Summer Sale is LIVE",
    subtitle:
      "Get up to 60% off on the entire summer collection. Limited time only!",
    discount: "60%",
    code: "KESARIYA60",
    endsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "First Order Special",
    subtitle: "New to Kesariya? Get flat ₹500 off on your first purchase.",
    discount: "₹500",
    code: "FIRST500",
    endsAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Feature Highlights ────────────────────────────────────────────────

export const features = [
  {
    icon: "Truck",
    title: "Free Shipping",
    description: "On orders above ₹999",
  },
  {
    icon: "RotateCcw",
    title: "Easy Returns",
    description: "7-day return policy",
  },
  {
    icon: "Shield",
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: "Headphones",
    title: "24/7 Support",
    description: "Dedicated assistance",
  },
];
