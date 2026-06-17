const prisma = require('../prismaClient');

exports.getIngredients = async (req, res, next) => {
  try {
    const ingredients = await prisma.ingredient.findMany();
    res.json(ingredients);
  } catch (err) {
    next(err);
  }
};

exports.getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ingredient = await prisma.ingredient.findUnique({ where: { id } });
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });
    res.json(ingredient);
  } catch (err) {
    next(err);
  }
};

exports.createIngredient = async (req, res, next) => {
  try {
    const { name, remaining, unit, minWarning } = req.body;
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        remaining: parseFloat(remaining) || 0,
        unit: unit || 'pcs',
        minWarning: parseFloat(minWarning) || 0,
      }
    });
    res.status(201).json(ingredient);
  } catch (err) {
    next(err);
  }
};

exports.updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, remaining, unit, minWarning } = req.body;
    
    const data = {};
    if (name !== undefined) data.name = name;
    if (remaining !== undefined) data.remaining = parseFloat(remaining);
    if (unit !== undefined) data.unit = unit;
    if (minWarning !== undefined) data.minWarning = parseFloat(minWarning);

    const ingredient = await prisma.ingredient.update({
      where: { id },
      data
    });
    res.json(ingredient);
  } catch (err) {
    next(err);
  }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.ingredient.delete({ where: { id } });
    res.json({ message: 'Ingredient deleted' });
  } catch (err) {
    next(err);
  }
};
