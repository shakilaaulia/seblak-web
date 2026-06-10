const prisma = require('../prismaClient');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        recipe: {
          include: { ingredient: true }
        }
      }
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId, isActive, variants, recipe } = req.body;
    let category = null;
    if (categoryId) {
       category = await prisma.category.findUnique({ where: { id: categoryId } });
    }
    if (!category && categoryId) {
       // if frontend sent a category but it doesn't exist, create it on the fly or just set it to empty
       category = await prisma.category.create({ data: { id: categoryId, name: 'Default Category' } });
    } else if (!categoryId) {
       // create a dummy category to satisfy FK if frontend didn't send one
       let defaultCat = await prisma.category.findFirst();
       if (!defaultCat) {
          defaultCat = await prisma.category.create({ data: { name: 'Default Category' } });
       }
       category = defaultCat;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        imageUrl: imageUrl || '',
        categoryId: category.id,
        isActive: isActive !== undefined ? isActive : true,
        variants: variants && variants.length > 0 ? {
          create: variants.map(v => ({
            name: v.name,
            price: parseFloat(v.price) || 0
          }))
        } : undefined,
        recipe: recipe && recipe.length > 0 ? {
          create: recipe.map(r => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity) || 1
          }))
        } : undefined
      },
      include: {
        variants: true,
        recipe: { include: { ingredient: true } }
      }
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
    
    const { variants, recipe, ...productData } = data;

    // Handle nested updates for variants and recipe by deleting and recreating
    if (variants !== undefined) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length > 0) {
        productData.variants = {
          create: variants.map(v => ({
            name: v.name,
            price: parseFloat(v.price) || 0
          }))
        };
      }
    }

    if (recipe !== undefined) {
      await prisma.productRecipeIngredient.deleteMany({ where: { productId: id } });
      if (recipe.length > 0) {
        productData.recipe = {
          create: recipe.map(r => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity) || 1
          }))
        };
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        variants: true,
        recipe: { include: { ingredient: true } }
      }
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock, 10) }
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
};
