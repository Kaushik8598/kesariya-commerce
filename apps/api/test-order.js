const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orderNumber = "ORD-260503-434"; // Use the user's order number
  
  console.log(`Searching for order: ${orderNumber}`);
  const order = await prisma.order.findUnique({
    where: { orderNumber }
  });
  console.log("Order found:", order);

  if (order) {
    try {
      const detailedOrder = await prisma.order.findFirst({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, slug: true, images: { where: { isPrimary: true }, take: 1 } },
              },
              variant: {
                select: { size: true, color: true },
              },
            },
          },
          shippingAddress: true,
          coupon: true,
        },
      });
      console.log("Detailed Order fetched successfully");
    } catch (e) {
      console.error("Error fetching detailed order:", e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
