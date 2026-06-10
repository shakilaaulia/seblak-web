const prisma = require('../prismaClient');

exports.getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allOrders = await prisma.order.findMany();
    const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= todayStart);
    
    const pendingOrders = allOrders.filter(o => o.status === 'PENDING').length;
    const processingOrders = allOrders.filter(o => o.status === 'PROCESSING').length;
    const completedToday = todayOrders.filter(o => o.status === 'COMPLETED').length;
    
    const totalRevenueToday = todayOrders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      totalOrdersToday: todayOrders.length,
      pendingOrders,
      processingOrders,
      completedToday,
      totalRevenueToday,
      totalOrdersAll: allOrders.length,
    });
  } catch (err) {
    next(err);
  }
};
