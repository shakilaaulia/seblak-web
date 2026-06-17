const prisma = require('../prismaClient');

exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Use Prisma count/aggregate instead of fetching all orders into memory
    const [totalOrdersAll, totalOrdersToday, pendingOrders, processingOrders, completedToday, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'COMPLETED', createdAt: { gte: todayStart } } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
      }),
    ]);

    res.json({
      totalOrdersToday,
      pendingOrders,
      processingOrders,
      completedToday,
      totalRevenueToday: revenueResult._sum.totalPrice || 0,
      totalOrdersAll,
    });
  } catch (err) {
    next(err);
  }
};
