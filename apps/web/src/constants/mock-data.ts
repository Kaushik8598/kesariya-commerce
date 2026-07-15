// ─── Types ─────────────────────────────────────────────────────────────



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
