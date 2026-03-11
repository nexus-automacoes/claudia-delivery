const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const path = require('path');
const pino = require('pino');

class BaileysService {
  constructor() {
    this.sock = null;
    this.qrCode = null;
    this.status = 'disconnected'; // disconnected | connecting | qr_ready | connected
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  emitStatus(event, data) {
    if (this.io) this.io.emit(event, data);
  }

  async connect() {
    // Lazy load bot service to avoid circular dependencies
    const botService = require('./bot.service');

    const authPath = path.join(__dirname, '../../.whatsapp-session');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    this.status = 'connecting';
    this.emitStatus('whatsapp:status', { status: 'connecting' });

    this.sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Claudia Delivery', 'Chrome', '1.0.0'],
      getMessage: async () => ({ conversation: '' })
    });

    // Connection updates (QR code, connect, disconnect)
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.status = 'qr_ready';
        this.qrCode = await qrcode.toDataURL(qr);
        this.emitStatus('whatsapp:qr', { qr: this.qrCode });
        this.emitStatus('whatsapp:status', { status: 'qr_ready' });
        console.log('[WhatsApp] QR Code gerado - aguardando leitura...');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error instanceof Boom)
          && lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log('[WhatsApp] Reconectando...');
          setTimeout(() => this.connect(), 3000);
        } else {
          this.status = 'disconnected';
          this.qrCode = null;
          this.emitStatus('whatsapp:status', { status: 'disconnected' });
          console.log('[WhatsApp] Desconectado');
        }
      }

      if (connection === 'open') {
        this.status = 'connected';
        this.qrCode = null;
        this.emitStatus('whatsapp:status', { status: 'connected', phone: this.sock.user?.id });
        console.log('[WhatsApp] Conectado:', this.sock.user?.id);
      }
    });

    // Save credentials
    this.sock.ev.on('creds.update', saveCreds);

    // Receive messages
    this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        if (!msg.message) continue;

        const from = msg.key.remoteJid;
        if (from.endsWith('@g.us')) continue; // Ignore groups

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          msg.message.buttonsResponseMessage?.selectedDisplayText ||
          '';

        if (!text.trim()) continue;

        console.log(`[WhatsApp] Mensagem de ${from}: ${text}`);

        try {
          const reply = await botService.processMessage(from, text);
          if (reply) {
            await this.sendMessage(from, reply);
          }
        } catch (error) {
          console.error('[WhatsApp] Erro no bot:', error);
          await this.sendMessage(from,
            'Tive um pequeno problema aqui. Pode repetir sua mensagem?'
          );
        }
      }
    });

    return this.sock;
  }

  async sendMessage(to, text) {
    if (!this.sock || this.status !== 'connected') {
      throw new Error('WhatsApp nao conectado');
    }
    await this.sock.sendMessage(to, { text });
  }

  async sendImage(to, imageBuffer, caption) {
    if (!this.sock || this.status !== 'connected') return;
    await this.sock.sendMessage(to, {
      image: imageBuffer,
      caption
    });
  }

  getStatus() {
    return {
      status: this.status,
      qr: this.qrCode,
      phone: this.sock?.user?.id || null
    };
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.status = 'disconnected';
      this.qrCode = null;
    }
  }
}

module.exports = new BaileysService();
