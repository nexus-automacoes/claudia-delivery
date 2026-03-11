const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const cats = await prisma.category.findMany();
  const marmitas = cats.find(c => c.name === 'Marmitas');
  const bebidas = cats.find(c => c.name === 'Bebidas');
  const sobremesas = cats.find(c => c.name === 'Sobremesas');

  // Mais produtos
  const novosProdutos = [
    { name: 'Marmita de Frango Grelhado', description: 'Frango grelhado com arroz, feijao, salada e farofa', price: 22.90, available: true, categoryId: marmitas.id },
    { name: 'Marmita de Carne de Panela', description: 'Carne de panela com batata, arroz, feijao e salada', price: 25.90, available: true, categoryId: marmitas.id },
    { name: 'Marmita de Peixe', description: 'File de tilapia grelhado com arroz, pure e salada', price: 27.90, available: true, categoryId: marmitas.id },
    { name: 'Marmita Vegana', description: 'Legumes salteados, arroz integral, feijao preto e salada', price: 19.90, available: true, categoryId: marmitas.id },
    { name: 'Marmita de Strogonoff', description: 'Strogonoff de frango com arroz, batata palha e salada', price: 24.90, available: true, categoryId: marmitas.id },
    { name: 'Marmita de Feijoada', description: 'Feijoada completa com arroz, couve, farofa e laranja', price: 26.90, available: true, categoryId: marmitas.id },
    { name: 'Marmita Low Carb', description: 'Frango desfiado, brocolis, abobrinha e ovo cozido', price: 23.90, available: true, categoryId: marmitas.id },
    { name: 'Agua Mineral 500ml', description: 'Agua mineral sem gas', price: 3.50, available: true, categoryId: bebidas.id },
    { name: 'Refrigerante Lata', description: 'Coca-Cola, Guarana ou Fanta', price: 5.90, available: true, categoryId: bebidas.id },
    { name: 'Suco de Laranja 300ml', description: 'Suco natural de laranja espremida na hora', price: 8.90, available: true, categoryId: bebidas.id },
    { name: 'Cha Gelado 500ml', description: 'Cha gelado de pessego ou limao', price: 6.90, available: true, categoryId: bebidas.id },
    { name: 'Bolo de Chocolate', description: 'Fatia de bolo de chocolate com cobertura', price: 9.90, available: true, categoryId: sobremesas.id },
    { name: 'Salada de Frutas', description: 'Frutas da estacao com creme e granola', price: 11.90, available: true, categoryId: sobremesas.id },
    { name: 'Mousse de Maracuja', description: 'Mousse cremoso de maracuja', price: 8.90, available: true, categoryId: sobremesas.id },
    { name: 'Acai 300ml', description: 'Acai batido com banana e granola', price: 14.90, available: true, categoryId: sobremesas.id },
  ];

  for (const p of novosProdutos) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.product.create({ data: p });
      console.log('+ Produto:', p.name);
    } else {
      console.log('= Ja existe:', p.name);
    }
  }

  // Clientes
  const clientes = [
    { name: 'Maria Silva', phone: '5567991001001', address: 'Rua Marcelino Pires, 1200', neighborhood: 'Centro', city: 'Dourados' },
    { name: 'Joao Santos', phone: '5567991002002', address: 'Av. Guaicurus, 350', neighborhood: 'Jardim America', city: 'Dourados' },
    { name: 'Ana Oliveira', phone: '5567991003003', address: 'Rua Hayel Bon Faker, 800', neighborhood: 'Centro', city: 'Dourados' },
    { name: 'Carlos Souza', phone: '5567991004004', address: 'Rua Filinto Muller, 450', neighborhood: 'Vila Industrial', city: 'Dourados' },
    { name: 'Patricia Lima', phone: '5567991005005', address: 'Av. Presidente Vargas, 2100', neighborhood: 'Jardim Caramuru', city: 'Dourados' },
    { name: 'Roberto Alves', phone: '5567991006006', address: 'Rua Monte Alegre, 180', neighborhood: 'Parque Alvorada', city: 'Dourados' },
    { name: 'Fernanda Costa', phone: '5567991007007', address: 'Rua Cuiaba, 520', neighborhood: 'Jardim Agua Boa', city: 'Dourados' },
    { name: 'Lucas Pereira', phone: '5567991008008', address: 'Rua Coronel Ponciano, 90', neighborhood: 'Centro', city: 'Dourados' },
    { name: 'Beatriz Rocha', phone: '5567991009009', address: 'Av. Marcelino Pires, 3500', neighborhood: 'Jardim Sao Pedro', city: 'Dourados' },
    { name: 'Marcos Ferreira', phone: '5567991010010', address: 'Rua Toshinobu Katayama, 600', neighborhood: 'Vila Progresso', city: 'Dourados' },
    { name: 'Julia Martins', phone: '5567991011011', address: 'Rua Bahia, 280', neighborhood: 'Jardim Ouro Verde', city: 'Dourados' },
    { name: 'Eduardo Ribeiro', phone: '5567991012012', address: 'Av. Joaquim Teixeira Alves, 1500', neighborhood: 'Centro', city: 'Dourados' },
  ];

  for (const c of clientes) {
    const exists = await prisma.customer.findFirst({ where: { phone: c.phone } });
    if (!exists) {
      await prisma.customer.create({ data: c });
      console.log('+ Cliente:', c.name);
    } else {
      console.log('= Ja existe:', c.name);
    }
  }

  // Pedidos
  const allProducts = await prisma.product.findMany();
  const allCustomers = await prisma.customer.findMany();

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'CANCELLED'];
    const payments = ['PIX', 'DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO'];

    for (let i = 0; i < 15; i++) {
      const customer = allCustomers[i % allCustomers.length];
      const numItems = 1 + Math.floor(Math.random() * 3);
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        const prod = allProducts[Math.floor(Math.random() * allProducts.length)];
        selectedProducts.push(prod);
      }

      const total = selectedProducts.reduce((sum, p) => sum + Number(p.price), 0);
      const status = statuses[i % statuses.length];
      const payment = payments[i % payments.length];

      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          status: status,
          total: total + 5,
          deliveryAddress: customer.address + ', ' + customer.neighborhood,
          deliveryFee: 5.00,
          paymentMethod: payment,
          notes: i % 3 === 0 ? 'Sem cebola por favor' : null,
          items: {
            create: selectedProducts.map(p => ({
              productId: p.id,
              quantity: 1,
              price: p.price,
            }))
          }
        }
      });
      console.log('+ Pedido #' + order.orderNumber + ' (' + status + ') - R$' + (total + 5).toFixed(2));
    }
  } else {
    console.log('= Pedidos ja existem:', existingOrders);
  }

  // Broadcast lists
  const existingList = await prisma.broadcastList.findFirst({ where: { name: 'Clientes VIP' } });
  if (!existingList) {
    await prisma.broadcastList.create({
      data: { name: 'Clientes VIP', phones: allCustomers.slice(0, 6).map(c => c.phone) }
    });
    console.log('+ BroadcastList: Clientes VIP');

    await prisma.broadcastList.create({
      data: { name: 'Todos os Clientes', phones: allCustomers.map(c => c.phone) }
    });
    console.log('+ BroadcastList: Todos os Clientes');
  }

  console.log('\n--- SEED COMPLETO ---');
  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    customers: await prisma.customer.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    broadcastLists: await prisma.broadcastList.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
}

seed().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
