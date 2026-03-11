const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const WhatsAppService = require('../services/whatsapp.service');

async function sendBroadcast(req, res, next) {
  try {
    const { phones, listId, message } = req.body;

    let targetPhones = phones;

    if (listId) {
      const list = await prisma.broadcastList.findUnique({
        where: { id: listId },
      });

      if (!list) {
        return res.status(404).json({ error: 'Lista nao encontrada' });
      }

      targetPhones = list.phones;
    }

    if (!targetPhones || targetPhones.length === 0) {
      // Se nao tem phones nem lista, envia pra todos os clientes
      const customers = await prisma.customer.findMany({
        where: { phone: { not: null } },
        select: { phone: true },
      });
      targetPhones = customers.map((c) => c.phone);
    }

    if (!targetPhones || targetPhones.length === 0) {
      return res.status(400).json({ error: 'Nenhum numero de telefone para enviar' });
    }

    // Verificar se tem imagem enviada
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const result = await WhatsAppService.sendBulk(targetPhones, message, imageUrl);

    const log = await prisma.broadcastLog.create({
      data: {
        message: imageUrl ? `[IMG] ${message}` : message,
        phones: targetPhones,
        totalSent: targetPhones.length,
        listId: listId || null,
      },
    });

    res.status(201).json({ log, result });
  } catch (error) {
    next(error);
  }
}

async function sendMenuBroadcast(req, res, next) {
  try {
    const { listId } = req.body;

    const products = await prisma.product.findMany({
      where: { available: true },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const message = WhatsAppService.formatMenuMessage(products);

    let targetPhones;

    if (listId) {
      const list = await prisma.broadcastList.findUnique({
        where: { id: listId },
      });

      if (!list) {
        return res.status(404).json({ error: 'Lista no encontrada' });
      }

      targetPhones = list.phones;
    } else {
      const customers = await prisma.customer.findMany({
        where: { phone: { not: null } },
        select: { phone: true },
      });

      targetPhones = customers.map((c) => c.phone);
    }

    if (!targetPhones || targetPhones.length === 0) {
      return res.status(400).json({ error: 'No hay numeros de telefono para enviar' });
    }

    const result = await WhatsAppService.sendBulk(targetPhones, message);

    const log = await prisma.broadcastLog.create({
      data: {
        message,
        phones: targetPhones,
        totalSent: targetPhones.length,
        listId: listId || null,
      },
    });

    res.status(201).json({ log, result });
  } catch (error) {
    next(error);
  }
}

async function getLogs(req, res, next) {
  try {
    const logs = await prisma.broadcastLog.findMany({
      orderBy: { sentAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
}

async function getLists(req, res, next) {
  try {
    const lists = await prisma.broadcastList.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(lists);
  } catch (error) {
    next(error);
  }
}

async function createList(req, res, next) {
  try {
    const { name, phones } = req.body;

    const list = await prisma.broadcastList.create({
      data: { name, phones },
    });

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
}

async function deleteList(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.broadcastList.delete({
      where: { id },
    });

    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendBroadcast,
  sendMenuBroadcast,
  getLogs,
  getLists,
  createList,
  deleteList,
};
