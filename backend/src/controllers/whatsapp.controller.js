const baileysService = require('../services/baileys.service');

async function getStatus(req, res) {
  res.json(baileysService.getStatus());
}

async function connect(req, res, next) {
  try {
    await baileysService.connect();
    res.json({ message: 'Conectando...' });
  } catch (error) {
    next(error);
  }
}

async function disconnect(req, res, next) {
  try {
    await baileysService.disconnect();
    res.json({ message: 'Desconectado' });
  } catch (error) {
    next(error);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { phone, message } = req.body;
    await baileysService.sendMessage(`${phone}@s.whatsapp.net`, message);
    res.json({ message: 'Enviado' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getStatus, connect, disconnect, sendMessage };
