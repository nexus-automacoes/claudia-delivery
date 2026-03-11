const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Iniciando seed do banco de dados...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('claudia123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@claudia.com' },
    update: {},
    create: {
      name: 'Admin Claudia',
      email: 'admin@claudia.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`[Seed] Usuario admin criado: ${adminUser.email}`);

  // Create categories
  const marmitas = await prisma.category.upsert({
    where: { id: 'cat-marmitas' },
    update: {},
    create: {
      id: 'cat-marmitas',
      name: 'Marmitas',
      icon: '\uD83C\uDF71',
    },
  });

  const bebidas = await prisma.category.upsert({
    where: { id: 'cat-bebidas' },
    update: {},
    create: {
      id: 'cat-bebidas',
      name: 'Bebidas',
      icon: '\uD83E\uDD64',
    },
  });

  const sobremesas = await prisma.category.upsert({
    where: { id: 'cat-sobremesas' },
    update: {},
    create: {
      id: 'cat-sobremesas',
      name: 'Sobremesas',
      icon: '\uD83C\uDF6E',
    },
  });

  console.log(`[Seed] Categorias criadas: ${marmitas.name}, ${bebidas.name}, ${sobremesas.name}`);

  // Create products
  const products = [
    {
      id: 'prod-marmita-tradicional',
      name: 'Marmita Tradicional',
      description: 'Arroz, feijao, carne, salada e farofa',
      price: 18.90,
      available: true,
      categoryId: marmitas.id,
    },
    {
      id: 'prod-marmita-fitness',
      name: 'Marmita Fitness',
      description: 'Arroz integral, frango grelhado, legumes e salada',
      price: 22.90,
      available: true,
      categoryId: marmitas.id,
    },
    {
      id: 'prod-marmita-executiva',
      name: 'Marmita Executiva',
      description: 'Arroz, feijao tropeiro, carne nobre, salada especial e sobremesa',
      price: 25.90,
      available: true,
      categoryId: marmitas.id,
    },
    {
      id: 'prod-suco-natural',
      name: 'Suco Natural 500ml',
      description: 'Suco de fruta natural - consulte sabores disponiveis',
      price: 8.90,
      available: true,
      categoryId: bebidas.id,
    },
    {
      id: 'prod-pudim-leite',
      name: 'Pudim de Leite',
      description: 'Pudim de leite condensado caseiro',
      price: 10.90,
      available: true,
      categoryId: sobremesas.id,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
    console.log(`[Seed] Produto criado: ${created.name} - R$${created.price}`);
  }

  console.log('[Seed] Seed concluido com sucesso!');
}

main()
  .catch((error) => {
    console.error('[Seed] Erro ao executar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
