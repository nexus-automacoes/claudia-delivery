const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const MachineService = require('../services/machine.service');

async function dispatchOrder(req, res, next) {
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

    const delivery = await MachineService.createDelivery(order);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        machineOrderId: delivery.id,
        status: 'DISPATCHED',
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
}

async function trackDelivery(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (!order.machineOrderId) {
      return res.status(400).json({ error: 'El pedido no tiene envio asociado' });
    }

    const tracking = await MachineService.trackDelivery(order.machineOrderId);

    res.json(tracking);
  } catch (error) {
    next(error);
  }
}

async function webhookMachine(req, res, next) {
  try {
    const { orderId, status, deliveryStatus } = req.body;

    const order = await prisma.order.findFirst({
      where: { machineOrderId: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    let newStatus = order.status;

    if (deliveryStatus === 'delivered' || status === 'delivered') {
      newStatus = 'DELIVERED';
    } else if (deliveryStatus === 'in_transit' || status === 'in_transit') {
      newStatus = 'DISPATCHED';
    } else if (deliveryStatus === 'cancelled' || status === 'cancelled') {
      newStatus = 'CANCELLED';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dispatchOrder,
  trackDelivery,
  webhookMachine,
};
