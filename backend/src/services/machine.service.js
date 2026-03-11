const axios = require('axios');

class MachineService {
  constructor() {
    this.baseURL = process.env.MACHINE_API_URL;
    this.apiKey = process.env.MACHINE_API_KEY;
  }

  async createDelivery(orderData) {
    const payload = {
      origem: {
        nome: 'Claudia Restaurante',
        telefone: '(67) 99999-9999',
        endereco: 'Endereço do Restaurante',
        bairro: 'Centro',
        cidade: 'Dourados',
        estado: 'MS',
      },
      destino: {
        nome: orderData.customerName,
        telefone: orderData.customerPhone,
        endereco: orderData.deliveryAddress,
        bairro: orderData.neighborhood,
        cidade: 'Dourados',
        estado: 'MS',
      },
    };

    const response = await axios.post(`${this.baseURL}/coletas`, payload, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async trackDelivery(machineOrderId) {
    const response = await axios.get(`${this.baseURL}/coletas/${machineOrderId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    return response.data;
  }
}

module.exports = new MachineService();
