const prisma = require('../prismaClient');

exports.getToppings = async (req, res, next) => {
  try {
    const toppings = await prisma.topping.findMany();
    res.json(toppings);
  } catch (err) {
    next(err);
  }
};

exports.getToppingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topping = await prisma.topping.findUnique({ where: { id } });
    if (!topping) return res.status(404).json({ message: 'Topping not found' });
    res.json(topping);
  } catch (err) {
    next(err);
  }
};

exports.createTopping = async (req, res, next) => {
  try {
    const { name, price, remaining, unit, minWarning } = req.body;
    const topping = await prisma.topping.create({
      data: {
        name,
        price: parseFloat(price) || 0,
        remaining: parseFloat(remaining) || 0,
        unit: unit || 'pcs',
        minWarning: parseFloat(minWarning) || 0,
      }
    });
    res.status(201).json(topping);
  } catch (err) {
    next(err);
  }
};

exports.updateTopping = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, remaining, unit, minWarning } = req.body;
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = parseFloat(price);
    if (remaining !== undefined) data.remaining = parseFloat(remaining);
    if (unit !== undefined) data.unit = unit;
    if (minWarning !== undefined) data.minWarning = parseFloat(minWarning);

    const topping = await prisma.topping.update({
      where: { id },
      data
    });
    res.json(topping);
  } catch (err) {
    next(err);
  }
};

exports.deleteTopping = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.topping.delete({ where: { id } });
    res.json({ message: 'Topping deleted' });
  } catch (err) {
    next(err);
  }
};
