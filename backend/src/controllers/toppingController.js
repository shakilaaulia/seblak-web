// src/controllers/toppingController.js
const prisma = require('../prismaClient');

/**
 * Returns all toppings that are currently in stock.
 * Only id, toppingName and price are exposed to the client.
 */
async function getAllToppings(_req, res) {
  const toppings = await prisma.topping.findMany({
    where: { isReady: true },
    select: { id: true, toppingName: true, price: true },
    orderBy: { toppingName: 'asc' },
  });
  res.json(toppings);
}

module.exports = { getAllToppings };
