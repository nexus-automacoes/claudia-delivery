const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /public/menu - Public endpoint, no auth required
router.get('/menu', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { available: true },
      include: { category: true },
      orderBy: { category: { name: 'asc' } }
    });

    const categories = await prisma.category.findMany({
      where: { products: { some: { available: true } } }
    });

    res.json({ products, categories });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
