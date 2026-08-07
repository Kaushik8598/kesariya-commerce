import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";

export async function GET(_request: NextRequest) {
  try {
    const [orders, totalProducts, totalUsers, categories] = await Promise.all([
      prisma.order.findMany({
        select: {
          id: true, total: true, status: true, createdAt: true,
          items: { select: { productId: true, quantity: true, price: true, product: { select: { name: true, category: { select: { name: true } } } } } },
        },
      }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.category.findMany({ select: { id: true, name: true } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    const categoryMap: Record<string, number> = {};
    categories.forEach((c) => (categoryMap[c.name] = 0));
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const catName = item.product?.category?.name || "General";
        const itemRevenue = Number(item.price || 0) * item.quantity;
        categoryMap[catName] = (categoryMap[catName] || 0) + itemRevenue;
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = { name: item.product?.name || "Product", quantity: 0, revenue: 0 };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += itemRevenue;
      });
    });

    return successResponse({
      stats: {
        totalRevenue, totalOrders: totalOrdersCount, totalCustomers: totalUsers,
        totalProducts, averageOrderValue: Math.round(averageOrderValue),
      },
      categorySales: Object.keys(categoryMap).map((catName) => ({ name: catName, sales: categoryMap[catName] })),
      topProducts: Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return serverErrorResponse();
  }
}
