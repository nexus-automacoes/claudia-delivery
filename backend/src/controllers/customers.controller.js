const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCustomers(req, res, next) {
  try {
    const { search } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(customers);
  } catch (error) {
    next(error);
  }
}

async function getCustomer(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { name, phone, address, neighborhood, city } = req.body;

    const customer = await prisma.customer.create({
      data: { name, phone, address, neighborhood, city },
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { name, phone, address, neighborhood, city } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: { name, phone, address, neighborhood, city },
    });

    res.json(customer);
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id },
    });

    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
}

async function importCustomers(req, res, next) {
  try {
    const customers = req.body;

    const results = await Promise.all(
      customers.map((customer) =>
        prisma.customer.upsert({
          where: { phone: customer.phone },
          update: { name: customer.name },
          create: {
            name: customer.name,
            phone: customer.phone,
          },
        })
      )
    );

    res.status(201).json({
      imported: results.length,
      customers: results,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  importCustomers,
};
