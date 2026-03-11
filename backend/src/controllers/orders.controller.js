const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIO } = require('../services/socket.service');

async function getOrders(req, res, next) {
  try {
    const { status, date, customerId } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrder(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function createOrder(req, res, next) {
  try {
    const { customerId, items, deliveryAddress, deliveryFee, notes, paymentMethod } = req.body;

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = {};
    for (const product of products) {
      productMap[product.id] = product;
    }

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = productMap[item.productId];
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }
      const unitPrice = product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        notes: item.notes || null,
      };
    });

    const total = subtotal + (deliveryFee || 0);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          customerId,
          deliveryAddress,
          deliveryFee: deliveryFee || 0,
          subtotal,
          total,
          notes,
          paymentMethod,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });

      return createdOrder;
    });

    try {
      const io = getIO();
      io.emit('new_order', order);
    } catch (_) {
      // Socket not initialized, skip emission
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    try {
      const io = getIO();
      io.emit('order_updated', order);
    } catch (_) {
      // Socket not initialized, skip emission
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [ordersToday, revenueResult, totalCustomers, pendingOrders] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.customer.count(),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
    ]);

    res.json({
      ordersToday,
      revenueToday: Number(revenueResult._sum.total) || 0,
      totalCustomers,
      pendingOrders,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateStatus,
  getStats,
};
