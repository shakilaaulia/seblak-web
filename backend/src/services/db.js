const prisma = require('../prismaClient');
const { createId } = require('../utils/id');

const productInclude = {
  variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
  recipeItems: { include: { ingredient: true }, orderBy: { createdAt: 'asc' } },
};

const orderInclude = {
  payment: true,
  items: {
    include: {
      toppings: true,
      variants: true,
    },
    orderBy: { createdAt: 'asc' },
  },
};

const sseListeners = new Set();
let orderCounter = 0;

function createHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function toInt(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.trunc(number);
}

function positiveInt(value, fallback = 1) {
  return Math.max(1, toInt(value, fallback));
}

function cleanString(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function mapProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    variants: (product.variants || []).map((variant) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
    })),
    recipe: (product.recipeItems || []).map((item) => ({
      ingredientId: item.ingredientId,
      name: item.ingredient?.name || '',
      quantity: item.quantity,
    })),
  };
}

function mapTopping(topping) {
  return {
    id: topping.id,
    name: topping.name,
    price: topping.price,
    remaining: topping.remaining,
    minWarning: topping.minWarning,
    unit: topping.unit,
    isActive: topping.isActive,
  };
}

function mapIngredient(ingredient) {
  return {
    id: ingredient.id,
    name: ingredient.name,
    remaining: ingredient.remaining,
    unit: ingredient.unit,
    minWarning: ingredient.minWarning,
    isActive: ingredient.isActive,
  };
}

function mapOrder(order) {
  const payment = order.payment;
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerWhatsapp: order.customerWhatsapp,
    notes: order.notes,
    totalPrice: order.totalPrice,
    paymentProofUrl: payment?.proofUrl || '',
    paymentProofFileName: payment?.proofFileName || '',
    paymentMethod: payment?.method || 'QRIS',
    paymentStatus: payment?.status || 'PENDING',
    status: order.status,
    declineReason: order.declineReason || undefined,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: (order.items || []).map((item) => {
      const toppings = (item.toppings || []).map((topping) => ({
        id: topping.toppingId || undefined,
        name: topping.toppingName,
        price: topping.price,
        quantity: topping.quantity,
      }));
      const selectedVariants = (item.variants || []).map((variant) => ({
        id: variant.variantId || undefined,
        name: variant.variantName,
        price: variant.price,
        quantity: variant.quantity,
      }));
      const hasCustomization = item.spiciness || item.soup || toppings.length > 0 || item.notes;

      return {
        id: item.id,
        orderId: item.orderId,
        productId: item.productId || '',
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        customization: hasCustomization ? {
          spiciness: item.spiciness,
          soup: item.soup,
          flavors: Array.isArray(item.flavors) ? item.flavors : [],
          toppings,
          notes: item.notes,
        } : undefined,
        selectedVariants: selectedVariants.length > 0 ? selectedVariants : undefined,
      };
    }),
  };
}

function addSSEListener(res) {
  sseListeners.add(res);
  return () => sseListeners.delete(res);
}

function notifySSE(order) {
  const payload = JSON.stringify(mapOrder(order));
  for (const res of sseListeners) {
    try {
      res.write(`event: new-order\ndata: ${payload}\n\n`);
    } catch {
      sseListeners.delete(res);
    }
  }
}

async function ensureCategory(categoryId) {
  const id = categoryId || 'makanan';
  const nameMap = { seblak: 'Seblak', makanan: 'Makanan', minuman: 'Minuman' };
  await prisma.category.upsert({
    where: { id },
    update: {},
    create: { id, name: nameMap[id] || id, sortOrder: id === 'seblak' ? 1 : id === 'makanan' ? 2 : 3 },
  });
  return id;
}

async function getAllProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: productInclude,
    orderBy: [{ categoryId: 'asc' }, { createdAt: 'asc' }],
  });
  return products.map(mapProduct);
}

async function getProductOrThrow(id) {
  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) throw createHttpError(404, 'Menu tidak ditemukan');
  return product;
}

async function createProduct(data) {
  const categoryId = await ensureCategory(cleanString(data.categoryId, 'makanan'));
  const variants = Array.isArray(data.variants) ? data.variants : [];
  const recipe = Array.isArray(data.recipe) ? data.recipe : [];
  const product = await prisma.product.create({
    data: {
      id: createId('p'),
      categoryId,
      name: cleanString(data.name),
      description: cleanString(data.description),
      price: Math.max(0, toInt(data.price, 0)),
      stock: Math.max(0, toInt(data.stock, 0)),
      imageUrl: cleanString(data.imageUrl),
      variants: {
        create: variants.map((variant, index) => ({
          name: cleanString(variant.name),
          price: Math.max(0, toInt(variant.price, 0)),
          sortOrder: index,
        })).filter((variant) => variant.name),
      },
      recipeItems: {
        create: recipe.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: positiveInt(item.quantity, 1),
        })).filter((item) => item.ingredientId),
      },
    },
    include: productInclude,
  });
  return mapProduct(product);
}

async function updateProduct(id, data) {
  const categoryId = data.categoryId ? await ensureCategory(cleanString(data.categoryId)) : undefined;
  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: cleanString(data.name) } : {}),
        ...(data.description !== undefined ? { description: cleanString(data.description) } : {}),
        ...(data.price !== undefined ? { price: Math.max(0, toInt(data.price, 0)) } : {}),
        ...(data.stock !== undefined ? { stock: Math.max(0, toInt(data.stock, 0)) } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: cleanString(data.imageUrl) } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      },
    });

    if (Array.isArray(data.variants)) {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      if (data.variants.length > 0) {
        await tx.productVariant.createMany({
          data: data.variants.map((variant, index) => ({
            productId: id,
            name: cleanString(variant.name),
            price: Math.max(0, toInt(variant.price, 0)),
            sortOrder: index,
          })).filter((variant) => variant.name),
        });
      }
    }

    if (Array.isArray(data.recipe)) {
      await tx.productIngredient.deleteMany({ where: { productId: id } });
      if (data.recipe.length > 0) {
        await tx.productIngredient.createMany({
          data: data.recipe.map((item) => ({
            productId: id,
            ingredientId: item.ingredientId,
            quantity: positiveInt(item.quantity, 1),
          })).filter((item) => item.ingredientId),
        });
      }
    }

    return tx.product.findUnique({ where: { id }, include: productInclude });
  });
  return mapProduct(product);
}

async function deleteProduct(id) {
  await getProductOrThrow(id);
  return prisma.product.delete({ where: { id } });
}

async function getAllIngredients() {
  const ingredients = await prisma.ingredient.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return ingredients.map(mapIngredient);
}

async function createIngredient(data) {
  const ingredient = await prisma.ingredient.create({
    data: {
      id: createId('i'),
      name: cleanString(data.name),
      remaining: Math.max(0, toInt(data.remaining, 0)),
      unit: cleanString(data.unit, 'pcs'),
      minWarning: Math.max(0, toInt(data.minWarning, 5)),
    },
  });
  return mapIngredient(ingredient);
}

async function updateIngredient(id, data) {
  const ingredient = await prisma.$transaction(async (tx) => {
    const before = await tx.ingredient.findUnique({ where: { id } });
    if (!before) throw createHttpError(404, 'Bahan tidak ditemukan');
    const updated = await tx.ingredient.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: cleanString(data.name) } : {}),
        ...(data.remaining !== undefined ? { remaining: Math.max(0, toInt(data.remaining, before.remaining)) } : {}),
        ...(data.unit !== undefined ? { unit: cleanString(data.unit, before.unit) } : {}),
        ...(data.minWarning !== undefined ? { minWarning: Math.max(0, toInt(data.minWarning, before.minWarning)) } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      },
    });
    if (data.remaining !== undefined && updated.remaining !== before.remaining) {
      await tx.stockMovement.create({
        data: {
          itemType: 'INGREDIENT',
          itemId: id,
          itemName: updated.name,
          delta: updated.remaining - before.remaining,
          remainingAfter: updated.remaining,
          reason: 'MANUAL_ADJUSTMENT',
        },
      });
    }
    return updated;
  });
  return mapIngredient(ingredient);
}

async function deleteIngredient(id) {
  return prisma.ingredient.delete({ where: { id } });
}

async function getAllToppings() {
  const toppings = await prisma.topping.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return toppings.map(mapTopping);
}

async function createTopping(data) {
  const topping = await prisma.topping.create({
    data: {
      id: createId('t'),
      name: cleanString(data.name),
      price: Math.max(0, toInt(data.price, 0)),
      remaining: Math.max(0, toInt(data.remaining, 0)),
      minWarning: Math.max(0, toInt(data.minWarning, 5)),
      unit: cleanString(data.unit, 'porsi'),
    },
  });
  return mapTopping(topping);
}

async function updateTopping(id, data) {
  const topping = await prisma.$transaction(async (tx) => {
    const before = await tx.topping.findUnique({ where: { id } });
    if (!before) throw createHttpError(404, 'Topping tidak ditemukan');
    const updated = await tx.topping.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: cleanString(data.name) } : {}),
        ...(data.price !== undefined ? { price: Math.max(0, toInt(data.price, before.price)) } : {}),
        ...(data.remaining !== undefined ? { remaining: Math.max(0, toInt(data.remaining, before.remaining)) } : {}),
        ...(data.unit !== undefined ? { unit: cleanString(data.unit, before.unit) } : {}),
        ...(data.minWarning !== undefined ? { minWarning: Math.max(0, toInt(data.minWarning, before.minWarning)) } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      },
    });
    if (data.remaining !== undefined && updated.remaining !== before.remaining) {
      await tx.stockMovement.create({
        data: {
          itemType: 'TOPPING',
          itemId: id,
          itemName: updated.name,
          delta: updated.remaining - before.remaining,
          remainingAfter: updated.remaining,
          reason: 'MANUAL_ADJUSTMENT',
        },
      });
    }
    return updated;
  });
  return mapTopping(topping);
}

async function deleteTopping(id) {
  return prisma.topping.delete({ where: { id } });
}

async function initOrderCounter() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { orderNumber: true },
  });
  if (!lastOrder) return;
  const match = lastOrder.orderNumber.match(/SBK-(\d+)/);
  if (match) orderCounter = toInt(match[1], 0);
}

async function getNextOrderNumber(tx = prisma) {
  if (orderCounter <= 0) await initOrderCounter();
  orderCounter += 1;
  return `#SBK-${String(orderCounter).padStart(3, '0')}`;
}

async function findToppingForOrder(tx, selected) {
  const toppingId = selected.id || selected.toppingId;
  const name = cleanString(selected.name);
  let topping = null;
  if (toppingId) topping = await tx.topping.findUnique({ where: { id: String(toppingId) } });
  if (!topping && name) topping = await tx.topping.findFirst({ where: { name, isActive: true } });
  if (!topping) throw createHttpError(400, `Topping ${name || toppingId} tidak ditemukan`);
  return topping;
}

async function createOrder(payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!payload.customerName || items.length === 0) {
    throw createHttpError(400, 'Data pesanan tidak lengkap');
  }

  const order = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurantSetting.findUnique({
      where: { id: 'rest-1' },
      select: { isOpen: true },
    });
    if (restaurant && !restaurant.isOpen) {
      throw createHttpError(400, 'Toko sedang tutup');
    }

    const orderNumber = await getNextOrderNumber(tx);
    const created = await tx.order.create({
      data: {
        orderNumber,
        customerName: cleanString(payload.customerName),
        customerWhatsapp: cleanString(payload.customerWhatsapp),
        notes: cleanString(payload.notes),
        totalPrice: 0,
        status: 'PENDING',
      },
    });

    let totalPrice = 0;

    for (const item of items) {
      const productId = cleanString(item.productId || item.menuId);
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: true },
      });
      if (!product) throw createHttpError(400, `Produk ${item.productName || item.name || productId} tidak ditemukan`);

      const quantity = positiveInt(item.quantity, 1);
      const unitPrice = Math.max(0, toInt(item.price, product.price));
      const subtotal = unitPrice * quantity;
      totalPrice += subtotal;

      const customization = item.customization || {};
      const createdItem = await tx.orderItem.create({
        data: {
          orderId: created.id,
          productId: product.id,
          productName: cleanString(item.productName || item.name, product.name),
          quantity,
          price: unitPrice,
          subtotal,
          spiciness: cleanString(customization.spiciness),
          soup: cleanString(customization.soup),
          flavors: Array.isArray(customization.flavors) ? customization.flavors : [],
          notes: cleanString(customization.notes),
        },
      });

      const selectedToppings = Array.isArray(customization.toppings) ? customization.toppings : [];
      for (const selected of selectedToppings) {
        const topping = await findToppingForOrder(tx, selected);
        const toppingQuantity = positiveInt(selected.quantity, 1);
        const toppingPrice = Math.max(0, toInt(selected.price, topping.price));
        await tx.orderItemTopping.create({
          data: {
            orderItemId: createdItem.id,
            toppingId: topping.id,
            toppingName: topping.name,
            price: toppingPrice,
            quantity: toppingQuantity,
            subtotal: toppingPrice * toppingQuantity,
          },
        });
      }

      const selectedVariants = Array.isArray(item.selectedVariants) ? item.selectedVariants : [];
      for (const selected of selectedVariants) {
        const variantName = cleanString(selected.name);
        const variant = product.variants.find((v) => v.name === variantName && v.isActive);
        await tx.orderItemVariant.create({
          data: {
            orderItemId: createdItem.id,
            variantId: variant?.id,
            variantName: variant?.name || variantName,
            price: Math.max(0, toInt(selected.price, variant?.price || 0)),
            quantity: positiveInt(selected.quantity, 1),
            subtotal: Math.max(0, toInt(selected.price, variant?.price || 0)) * positiveInt(selected.quantity, 1),
          },
        });
      }
    }

    await tx.order.update({ where: { id: created.id }, data: { totalPrice } });
    await tx.payment.create({
      data: {
        orderId: created.id,
        amount: totalPrice,
        method: 'QRIS',
        status: 'PENDING',
        proofUrl: cleanString(payload.paymentProofUrl),
        proofFileName: cleanString(payload.paymentProofFileName),
      },
    });
    await tx.notification.create({
      data: {
        type: 'NEW_ORDER',
        title: 'Pesanan Baru',
        message: `Pesanan ${orderNumber} dari ${created.customerName} masuk!`,
        orderId: created.id,
      },
    });

    return tx.order.findUnique({ where: { id: created.id }, include: orderInclude });
  });

  notifySSE(order);
  return mapOrder(order);
}

async function getAllOrders(status, search) {
  const where = {};
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerWhatsapp: { contains: search, mode: 'insensitive' } },
      { orderNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  const orders = await prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(mapOrder);
}

async function getOrderById(id) {
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  return order ? mapOrder(order) : null;
}

async function decrementIngredientStock(tx, ingredient, amount, orderId) {
  const updated = await tx.ingredient.updateMany({
    where: { id: ingredient.id, remaining: { gte: amount }, isActive: true },
    data: { remaining: { decrement: amount } },
  });
  if (updated.count === 0) throw createHttpError(400, `Stok ${ingredient.name} tidak cukup`);
  const after = await tx.ingredient.findUnique({ where: { id: ingredient.id } });
  await tx.stockMovement.create({
    data: {
      itemType: 'INGREDIENT',
      itemId: ingredient.id,
      itemName: ingredient.name,
      orderId,
      delta: -amount,
      remainingAfter: after.remaining,
      reason: 'ORDER_APPROVED',
    },
  });
}

async function decrementToppingStock(tx, topping, amount, orderId) {
  const updated = await tx.topping.updateMany({
    where: { id: topping.id, remaining: { gte: amount }, isActive: true },
    data: { remaining: { decrement: amount } },
  });
  if (updated.count === 0) throw createHttpError(400, `Stok ${topping.name} tidak cukup`);
  const after = await tx.topping.findUnique({ where: { id: topping.id } });
  await tx.stockMovement.create({
    data: {
      itemType: 'TOPPING',
      itemId: topping.id,
      itemName: topping.name,
      orderId,
      delta: -amount,
      remainingAfter: after.remaining,
      reason: 'ORDER_APPROVED',
    },
  });
}

async function deductOrderStock(tx, order) {
  for (const item of order.items) {
    const productQuantity = positiveInt(item.quantity, 1);

    if (item.productId) {
      const recipe = await tx.productIngredient.findMany({
        where: { productId: item.productId },
        include: { ingredient: true },
      });
      for (const recipeItem of recipe) {
        const required = recipeItem.quantity * productQuantity;
        if (required > 0) await decrementIngredientStock(tx, recipeItem.ingredient, required, order.id);
      }
    }

    for (const selectedTopping of item.toppings) {
      if (!selectedTopping.toppingId) continue;
      const topping = await tx.topping.findUnique({ where: { id: selectedTopping.toppingId } });
      if (!topping) throw createHttpError(400, `Topping ${selectedTopping.toppingName} tidak ditemukan`);
      const required = selectedTopping.quantity * productQuantity;
      if (required > 0) await decrementToppingStock(tx, topping, required, order.id);
    }
  }
}

async function updateOrderStatus(id, newStatus, declineReason) {
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id },
      include: {
        payment: true,
        items: { include: { toppings: true, variants: true }, orderBy: { createdAt: 'asc' } },
      },
    });
    if (!existing) return null;

    if (existing.status === 'PENDING' && newStatus === 'PROCESSING') {
      await deductOrderStock(tx, existing);
      await tx.payment.updateMany({
        where: { orderId: id },
        data: { status: 'VERIFIED', verifiedAt: new Date() },
      });
    }

    if (newStatus === 'DECLINED') {
      await tx.payment.updateMany({ where: { orderId: id }, data: { status: 'REJECTED' } });
    }

    const updated = await tx.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...(declineReason ? { declineReason: cleanString(declineReason) } : {}),
      },
      include: orderInclude,
    });

    if (newStatus === 'READY' && existing.status !== 'READY') {
      await tx.notification.create({
        data: {
          type: 'ORDER_READY',
          title: 'Pesanan Siap!',
          message: `Pesanan ${updated.orderNumber} siap diambil!`,
          orderId: updated.id,
        },
      });
    }

    return updated;
  });
  return order ? mapOrder(order) : null;
}

async function getDashboardSummary() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [totalOrdersToday, pendingOrders, processingOrders, completedToday, completedOrders] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'COMPLETED', createdAt: { gte: todayStart } } }),
    prisma.order.findMany({ where: { status: 'COMPLETED', createdAt: { gte: todayStart } }, select: { totalPrice: true } }),
  ]);
  return {
    totalOrdersToday,
    pendingOrders,
    processingOrders,
    completedToday,
    totalRevenueToday: completedOrders.reduce((sum, order) => sum + order.totalPrice, 0),
  };
}

async function getRestaurant() {
  return prisma.restaurantSetting.upsert({
    where: { id: 'rest-1' },
    update: {},
    create: { id: 'rest-1' },
  });
}

async function updateRestaurant(data) {
  return prisma.restaurantSetting.upsert({
    where: { id: 'rest-1' },
    update: {
      ...(data.name !== undefined ? { name: cleanString(data.name) } : {}),
      ...(data.description !== undefined ? { description: cleanString(data.description) } : {}),
      ...(data.address !== undefined ? { address: cleanString(data.address) } : {}),
      ...(data.phone !== undefined ? { phone: cleanString(data.phone) } : {}),
      ...(data.logoUrl !== undefined ? { logoUrl: cleanString(data.logoUrl) } : {}),
      ...(data.isOpen !== undefined ? { isOpen: Boolean(data.isOpen) } : {}),
      ...(data.openHour !== undefined ? { openHour: cleanString(data.openHour) } : {}),
      ...(data.closeHour !== undefined ? { closeHour: cleanString(data.closeHour) } : {}),
      ...(data.qrisName !== undefined ? { qrisName: cleanString(data.qrisName) } : {}),
      ...(data.qrisImageUrl !== undefined ? { qrisImageUrl: cleanString(data.qrisImageUrl) } : {}),
    },
    create: {
      id: 'rest-1',
      name: cleanString(data.name, 'Seblak Mamah Zahwa'),
      description: cleanString(data.description),
      address: cleanString(data.address),
      phone: cleanString(data.phone),
      logoUrl: cleanString(data.logoUrl),
      isOpen: data.isOpen === undefined ? true : Boolean(data.isOpen),
      openHour: cleanString(data.openHour, '09:00'),
      closeHour: cleanString(data.closeHour, '21:00'),
      qrisName: cleanString(data.qrisName, 'SEBLAK MAMAH ZAHWA'),
      qrisImageUrl: cleanString(data.qrisImageUrl),
    },
  });
}

module.exports = {
  addSSEListener,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  getAllToppings,
  createTopping,
  updateTopping,
  deleteTopping,
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardSummary,
  getRestaurant,
  updateRestaurant,
  initOrderCounter,
};
