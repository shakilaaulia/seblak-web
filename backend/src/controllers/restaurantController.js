const prisma = require('../prismaClient');

exports.getRestaurant = async (req, res, next) => {
  try {
    let restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      // Seed default
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'Seblak Mamah Zahwa',
          description: '',
          address: '',
          phone: '',
          logoUrl: ''
        }
      });
    }
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const data = req.body;
    let restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      restaurant = await prisma.restaurant.create({ data: { name: 'Seblak Mamah Zahwa', description: '', address: '', phone: '', logoUrl: '' } });
    }
    
    restaurant = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data
    });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
};
