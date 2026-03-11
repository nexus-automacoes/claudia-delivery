const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const whatsappService = require('./whatsapp.service');

const prisma = new PrismaClient();

function initScheduler() {
  // Envia cardápio automaticamente de segunda a sábado às 11h (horário de Campo Grande)
  cron.schedule(
    '0 11 * * 1-6',
    async () => {
      try {
        console.log('[Scheduler] Iniciando envio automático do cardápio...');

        // Buscar produtos disponíveis com categoria
        const products = await prisma.product.findMany({
          where: { available: true },
          include: { category: true },
          orderBy: { category: { name: 'asc' } },
        });

        if (products.length === 0) {
          console.log('[Scheduler] Nenhum produto disponível. Envio cancelado.');
          return;
        }

        // Formatar mensagem do cardápio
        const message = whatsappService.formatMenuMessage(products, new Date());

        // Buscar todos os clientes com telefone
        const customers = await prisma.customer.findMany({
          where: {
            phone: { not: null },
          },
          select: { phone: true },
        });

        if (customers.length === 0) {
          console.log('[Scheduler] Nenhum cliente encontrado. Envio cancelado.');
          return;
        }

        const phones = customers.map((c) => c.phone);

        // Enviar em massa
        const result = await whatsappService.sendBulk(phones, message);

        console.log(
          `[Scheduler] Envio concluído - Sucesso: ${result.success}, Falhas: ${result.failed}`
        );
      } catch (error) {
        console.error('[Scheduler] Erro no envio automático:', error.message);
      }
    },
    {
      timezone: 'America/Campo_Grande',
    }
  );

  console.log('[Scheduler] Agendamento do cardápio configurado (seg-sáb às 11h)');
}

module.exports = { initScheduler };
