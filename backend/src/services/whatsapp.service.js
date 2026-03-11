const axios = require('axios');

class WhatsAppService {
  formatMenuMessage(products, date) {
    const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    let message = `🍽️ *CARDÁPIO DO DIA* 🍽️\n`;
    message += `📅 ${formattedDate}\n\n`;

    const grouped = {};
    for (const product of products) {
      const category = product.category?.name || 'Outros';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    }

    for (const [category, items] of Object.entries(grouped)) {
      message += `*${category}*\n`;
      for (const item of items) {
        const price = Number(item.price).toFixed(2).replace('.', ',');
        message += `  🔸 ${item.name} - R$ ${price}\n`;
        if (item.description) {
          message += `     _${item.description}_\n`;
        }
      }
      message += `\n`;
    }

    message += `📲 Faça seu pedido pelo WhatsApp!\n`;
    message += `⏰ Horário de funcionamento: 11h às 14h\n`;
    message += `🚗 Delivery disponível!`;

    return message;
  }

  async sendMessage(phone, message) {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}/message/sendText/${process.env.WHATSAPP_INSTANCE}`,
      {
        number: phone,
        text: message,
      },
      {
        headers: {
          apikey: process.env.WHATSAPP_API_KEY,
        },
      }
    );

    return response.data;
  }

  async sendImage(phone, imageUrl, caption) {
    const response = await axios.post(
      `${process.env.WHATSAPP_API_URL}/message/sendMedia/${process.env.WHATSAPP_INSTANCE}`,
      {
        number: phone,
        mediatype: 'image',
        media: imageUrl,
        caption: caption || '',
      },
      {
        headers: {
          apikey: process.env.WHATSAPP_API_KEY,
        },
      }
    );
    return response.data;
  }

  async sendBulk(phones, message, imageUrl) {
    let success = 0;
    let failed = 0;

    for (const phone of phones) {
      try {
        if (imageUrl) {
          await this.sendImage(phone, imageUrl, message);
        } else {
          await this.sendMessage(phone, message);
        }
        success++;
      } catch (error) {
        console.error(`Falha ao enviar para ${phone}:`, error.message);
        failed++;
      }

      // Delay de 1500ms entre cada envio para evitar bloqueio
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return { success, failed };
  }
}

module.exports = new WhatsAppService();
