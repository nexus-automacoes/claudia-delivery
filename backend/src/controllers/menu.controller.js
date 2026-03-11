const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getProducts(req, res, next) {
  try {
    const { available, categoryId } = req.query;

    const where = {};

    if (available === 'true') {
      where.available = true;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, price, image, categoryId, available } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        categoryId,
        available: available !== undefined ? available : true,
      },
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, available } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        image,
        categoryId,
        available,
      },
      include: { category: true },
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
}

async function toggleAvailability(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { available: !product.available },
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, description, image } = req.body;

    const category = await prisma.category.create({
      data: { name, description, image },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getCategories,
  createCategory,
};
