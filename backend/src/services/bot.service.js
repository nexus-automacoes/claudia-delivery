const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize Anthropic client - will use ANTHROPIC_API_KEY env var automatically
let anthropic = null;
try {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} catch (e) {
  console.log('[Bot] Anthropic API key not configured - bot will not respond');
}

// In-memory conversation history per phone number
const conversationHistory = new Map();
const MAX_HISTORY = 20;

class BotService {

  // Fetch current menu from database
  async getMenuContext() {
    const products = await prisma.product.findMany({
      where: { available: true },
      include: { category: true },
      orderBy: [{ category: { name: 'asc' } }, { name: 'asc' }]
    });

    if (products.length === 0) {
      return 'Nenhum produto disponivel no momento.';
    }

    const grouped = {};
    products.forEach(p => {
      const cat = p.category.name;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });

    let menuText = 'CARDAPIO ATUAL (atualizado em tempo real do banco de dados):\n\n';

    Object.entries(grouped).forEach(([cat, items]) => {
      menuText += `=== ${cat.toUpperCase()} ===\n`;
      items.forEach(p => {
        menuText += `- ${p.name} - R$ ${Number(p.price).toFixed(2)}\n`;
        if (p.description) menuText += `  ${p.description}\n`;
      });
      menuText += '\n';
    });

    return menuText;
  }

  // Build system prompt with restaurant context
  async buildSystemPrompt() {
    const menu = await this.getMenuContext();
    const storeLinkURL = process.env.STORE_URL || 'http://localhost:5173';

    return `Voce e a Claudia, atendente virtual do Claudia Restaurante em Dourados, MS.

Voce e simpatica, eficiente, conhece EXATAMENTE o cardapio e ajuda os clientes a fazerem pedidos.

INFORMACOES DO RESTAURANTE:
- Nome: Claudia Restaurante
- Localizacao: Dourados, MS
- Horario: Segunda a Sabado, 10h as 20h
- Entrega: Apenas delivery (entregamos em Dourados)
- Tempo de entrega: 30 a 45 minutos
- Pagamento: PIX, Dinheiro, Cartao de Credito, Cartao de Debito
- Link do cardapio online: ${storeLinkURL}

${menu}

SUAS RESPONSABILIDADES:
1. Apresentar o cardapio de forma atrativa quando pedido
2. Responder duvidas sobre ingredientes, precos, disponibilidade
3. Ajudar o cliente a montar o pedido
4. Quando o cliente decidir o que quer, enviar o link do cardapio para finalizar: ${storeLinkURL}
5. Coletar endereco de entrega quando necessario
6. Informar formas de pagamento
7. Ser vendedora! Sugira combos, itens populares

REGRAS IMPORTANTES:
- So venda produtos que estao no cardapio acima
- Se um produto nao esta no cardapio, diga que esta em falta hoje
- Seja concisa - respostas curtas e objetivas no WhatsApp
- Use emojis com moderacao
- NUNCA invente precos ou produtos que nao existem no banco
- Quando finalizar a venda, mande o link: ${storeLinkURL}

Responda sempre em portugues brasileiro informal, como uma atendente real e simpatica.`;
  }

  // Process incoming message from customer
  async processMessage(phoneNumber, userMessage) {
    if (!anthropic) {
      console.log('[Bot] Anthropic API key not configured');
      return 'Ola! Nosso atendimento automatico esta em configuracao. Por favor, aguarde um momento que ja iremos te atender!';
    }

    // Get or create conversation history
    if (!conversationHistory.has(phoneNumber)) {
      conversationHistory.set(phoneNumber, []);
    }

    const history = conversationHistory.get(phoneNumber);

    // Add user message to history
    history.push({
      role: 'user',
      content: userMessage
    });

    // Keep history within max limit
    if (history.length > MAX_HISTORY) {
      history.splice(0, history.length - MAX_HISTORY);
    }

    // Build system prompt with real-time menu
    const systemPrompt = await this.buildSystemPrompt();

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: history
    });

    const botReply = response.content[0].text;

    // Add bot response to history
    history.push({
      role: 'assistant',
      content: botReply
    });

    // Save updated history
    conversationHistory.set(phoneNumber, history);

    // Log conversation to database
    await this.logConversation(phoneNumber, userMessage, botReply);

    return botReply;
  }

  // Clear history (when order is finalized)
  clearHistory(phoneNumber) {
    conversationHistory.delete(phoneNumber);
  }

  // Save log to database
  async logConversation(phone, userMsg, botMsg) {
    try {
      await prisma.conversationLog.create({
        data: {
          phone,
          userMessage: userMsg,
          botResponse: botMsg
        }
      });
    } catch (e) {
      // Silent log - don't break the flow
    }
  }
}

module.exports = new BotService();
