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
    // Whitelist allowed fields to prevent id overwrite or invalid field injection
    const { name, description, address, phone, logoUrl } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (address !== undefined) data.address = address;
    if (phone !== undefined) data.phone = phone;
    if (logoUrl !== undefined) data.logoUrl = logoUrl;

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
