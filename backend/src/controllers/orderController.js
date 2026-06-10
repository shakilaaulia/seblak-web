const prisma = require('../prismaClient');

exports.getOrders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let where = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerWhatsapp: { contains: search } }
      ];
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, customerWhatsapp, notes, totalPrice, paymentProofUrl, items } = req.body;
    
    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Data pesanan tidak lengkap' });
    }

    // Generate Order Number
    const count = await prisma.order.count();
    const orderNumber = `#SBK-${String(count + 1).padStart(3, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerWhatsapp: customerWhatsapp || '',
        notes: notes || '',
        totalPrice: parseFloat(totalPrice) || 0,
        paymentProofUrl: paymentProofUrl || '',
        status: 'PENDING',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            productName: item.productName || item.name || '',
            quantity: parseInt(item.quantity, 10) || 1,
            price: parseFloat(item.price) || 0,
            subtotal: (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
            customization: item.customization ? JSON.stringify(item.customization) : null,
            selectedVariants: item.selectedVariants ? JSON.stringify(item.selectedVariants) : null
          }))
        }
      },
      include: { items: true }
    });
    
    // Create Notification
    await prisma.notification.create({
      data: {
        title: 'Pesanan Baru',
        message: `Pesanan ${order.orderNumber} dari ${order.customerName} masuk!`,
        orderId: order.id
      }
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // e.g. 'approve', 'process', 'ready', 'complete', 'decline'
    
    const validActions = ['approve', 'process', 'ready', 'complete', 'decline'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const statusMap = {
      approve: 'PROCESSING',
      process: 'PROCESSING',
      ready: 'READY',
      complete: 'COMPLETED',
      decline: 'DECLINED',
    };

    const newStatus = statusMap[action];
    
    const updateData = { status: newStatus };
    if (action === 'decline') {
      updateData.declineReason = req.body.declineReason || '';
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true }
    });
    
    if (newStatus === 'READY') {
      await prisma.notification.create({
        data: {
          title: 'Pesanan Siap!',
          message: `Pesanan ${order.orderNumber} siap diambil!`,
          orderId: order.id
        }
      });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};
