# 🍱 CLAUDIA DELIVERY — Claude Code Prompt Completo

> Copie este arquivo para: `~/Documentos/sistemas/claudia-delivery/CLAUDE.md`
> Depois rode: `claude` dentro da pasta e cole o conteúdo abaixo como primeira mensagem.

---

## 🎯 MISSÃO DO PROJETO

Construir um sistema completo de delivery para restaurante de marmitas chamado **Claudia Delivery**.
Sistema local (localhost) com banco de dados no Render.com PostgreSQL já provisionado.

---

## 🛠 TECH STACK

| Camada | Tecnologia |
|--------|------------|
| Backend | Node.js + Express.js |
| Frontend | React + Vite + TailwindCSS |
| Banco de dados | PostgreSQL (Render.com) |
| ORM | Prisma |
| Tempo real | Socket.io |
| Autenticação | JWT + bcrypt |
| WhatsApp | Evolution API (já disponível internamente) |
| Delivery | Machine/Entregas e Coletas API |
| Notificações | node-cron (disparo diário do cardápio) |

---

## 🗄 BANCO DE DADOS — CONEXÃO RENDER.COM

```
DATABASE_URL=postgresql://restaurantes_user:EKPrrSJci5a01AZWIpZlp4ZQB1tMNbvY@dpg-d6ksu37afjfc73emb8ag-a.oregon-postgres.render.com/restaurantes_database
```

**Arquivo `.env` (raiz do projeto):**
```env
# Database
DATABASE_URL=postgresql://restaurantes_user:EKPrrSJci5a01AZWIpZlp4ZQB1tMNbvY@dpg-d6ksu37afjfc73emb8ag-a.oregon-postgres.render.com/restaurantes_database

# App
PORT=3333
NODE_ENV=development
JWT_SECRET=claudia_delivery_secret_2025

# Machine API (Entregas e Coletas)
MACHINE_API_URL=https://vendas.machine.global/api/integracao
MACHINE_API_KEY=mch_api_HKJGg8EFRGZArFiodKPitKFE
MACHINE_LOGIN=automacoesvon@gmail.com
MACHINE_PASSWORD=Ent12345#

# WhatsApp (Evolution API - configurar depois)
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=sua_chave_aqui
WHATSAPP_INSTANCE=claudia-restaurante

# Frontend
VITE_API_URL=http://localhost:3333
```

---

## 📁 ESTRUTURA DO PROJETO

```
claudia-delivery/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── menu.controller.js
│   │   │   ├── orders.controller.js
│   │   │   ├── delivery.controller.js
│   │   │   ├── customers.controller.js
│   │   │   └── broadcast.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── menu.routes.js
│   │   │   ├── orders.routes.js
│   │   │   ├── delivery.routes.js
│   │   │   ├── customers.routes.js
│   │   │   └── broadcast.routes.js
│   │   ├── services/
│   │   │   ├── machine.service.js       ← Integração Machine API
│   │   │   ├── whatsapp.service.js      ← Disparo WhatsApp
│   │   │   ├── scheduler.service.js     ← Cron jobs cardápio diário
│   │   │   └── socket.service.js        ← Tempo real pedidos
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── errorHandler.middleware.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx            ← Visão geral + métricas
│   │   │   ├── Pedidos.jsx              ← Painel de pedidos em tempo real (kanban)
│   │   │   ├── Cardapio.jsx             ← CRUD de produtos/marmitas
│   │   │   ├── Clientes.jsx             ← Lista de clientes + WhatsApp
│   │   │   ├── Entregadores.jsx         ← Painel de entregadores Machine API
│   │   │   └── Broadcast.jsx            ← Disparos WhatsApp em massa
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── OrderKanban.jsx
│   │   │   │   └── OrderModal.jsx
│   │   │   ├── menu/
│   │   │   │   ├── MenuCard.jsx
│   │   │   │   └── MenuForm.jsx
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── StatsCard.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useOrders.js
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── useStore.js              ← Zustand
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🗃 SCHEMA PRISMA (banco completo)

```prisma
// backend/src/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String     @id @default(cuid())
  name      String
  icon      String?
  products  Product[]
  createdAt DateTime   @default(now())
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Decimal     @db.Decimal(10,2)
  image       String?
  available   Boolean     @default(true)
  categoryId  String
  category    Category    @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Customer {
  id          String   @id @default(cuid())
  name        String
  phone       String   @unique   // WhatsApp número
  address     String?
  neighborhood String?
  city        String?  @default("Dourados")
  orders      Order[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     Int         @default(autoincrement())
  customerId      String
  customer        Customer    @relation(fields: [customerId], references: [id])
  items           OrderItem[]
  status          OrderStatus @default(PENDING)
  total           Decimal     @db.Decimal(10,2)
  deliveryAddress String
  deliveryFee     Decimal?    @db.Decimal(10,2)
  notes           String?
  paymentMethod   PaymentMethod @default(PIX)
  
  // Machine API
  machineOrderId  String?     // ID retornado pela Machine API
  trackingCode    String?     // Código rastreamento entregador
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10,2)
  notes     String?
}

model BroadcastList {
  id        String   @id @default(cuid())
  name      String
  phones    String[] // array de números
  createdAt DateTime @default(now())
}

model BroadcastLog {
  id          String   @id @default(cuid())
  listName    String
  message     String
  totalSent   Int
  totalFailed Int
  sentAt      DateTime @default(now())
}

enum Role {
  ADMIN
  OPERATOR
}

enum OrderStatus {
  PENDING        // Aguardando confirmação
  CONFIRMED      // Confirmado
  PREPARING      // Em preparo
  READY          // Pronto para entrega
  DISPATCHED     // Saiu para entrega (Machine API acionada)
  DELIVERED      // Entregue
  CANCELLED      // Cancelado
}

enum PaymentMethod {
  PIX
  DINHEIRO
  CARTAO_CREDITO
  CARTAO_DEBITO
}
```

---

## 🚀 PASSO A PASSO DE CONSTRUÇÃO

### FASE 1 — Setup e Banco de Dados

```bash
# 1. Criar estrutura
mkdir -p claudia-delivery/{backend,frontend}
cd claudia-delivery/backend
npm init -y
npm install express prisma @prisma/client dotenv cors helmet morgan jsonwebtoken bcrypt socket.io node-cron axios

# 2. Inicializar Prisma
npx prisma init

# 3. Colar o schema acima em prisma/schema.prisma

# 4. Rodar migrations
npx prisma migrate dev --name init
npx prisma generate

# 5. Seed inicial (admin user + categorias)
npx prisma db seed
```

### FASE 2 — Backend APIs

Criar todas as rotas REST:

**Pedidos (`/api/orders`):**
- `GET /` — listar pedidos com filtros (status, data, cliente)
- `POST /` — criar pedido
- `PATCH /:id/status` — atualizar status
- `POST /:id/dispatch` — acionar Machine API para entrega
- `GET /:id` — detalhes do pedido

**Cardápio (`/api/products`):**
- CRUD completo de produtos
- Toggle disponibilidade

**Clientes (`/api/customers`):**
- CRUD + histórico de pedidos
- Importar lista de WhatsApp

**Broadcast (`/api/broadcast`):**
- `POST /send` — disparar mensagem para lista
- `POST /send-menu` — disparar cardápio do dia formatado
- `GET /logs` — histórico de disparos

### FASE 3 — Machine API Service

```javascript
// backend/src/services/machine.service.js

class MachineService {
  constructor() {
    this.baseURL = process.env.MACHINE_API_URL
    this.apiKey = process.env.MACHINE_API_KEY
  }

  // Criar coleta/entrega
  async createDelivery(orderData) {
    const payload = {
      origem: {
        nome: "Claudia Restaurante",
        telefone: "67999999999",      // fixo do restaurante
        endereco: "Rua do Restaurante, 123",
        bairro: "Centro",
        cidade: "Dourados",
        estado: "MS"
      },
      destino: {
        nome: orderData.customerName,
        telefone: orderData.customerPhone,
        endereco: orderData.deliveryAddress,
        bairro: orderData.neighborhood,
        cidade: "Dourados",
        estado: "MS"
      },
      descricao: `Pedido #${orderData.orderNumber} — ${orderData.itemsSummary}`,
      valor_declarado: orderData.total
    }
    
    const response = await axios.post(
      `${this.baseURL}/coletas`,
      payload,
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    )
    
    return response.data
  }

  // Rastrear entrega
  async trackDelivery(machineOrderId) {
    const response = await axios.get(
      `${this.baseURL}/coletas/${machineOrderId}`,
      { headers: { Authorization: `Bearer ${this.apiKey}` } }
    )
    return response.data
  }
}
```

### FASE 4 — WhatsApp Broadcast Service

```javascript
// backend/src/services/whatsapp.service.js

class WhatsAppService {
  // Formatar cardápio do dia como mensagem bonita
  formatMenuMessage(products, date) {
    const emoji = { marmita: '🍱', bebida: '🥤', sobremesa: '🍮' }
    
    let msg = `🌟 *CARDÁPIO DE HOJE*\n`
    msg += `📅 ${date}\n\n`
    msg += `*🍽 CLAUDIA RESTAURANTE*\n`
    msg += `━━━━━━━━━━━━━━━━━━\n\n`
    
    products.forEach(p => {
      msg += `🍱 *${p.name}*\n`
      if (p.description) msg += `   ${p.description}\n`
      msg += `   💰 R$ ${p.price}\n\n`
    })
    
    msg += `━━━━━━━━━━━━━━━━━━\n`
    msg += `📱 Para pedir, responda esta mensagem!\n`
    msg += `🛵 Entrega no seu endereço\n`
    msg += `⚡ Pagamento: PIX, Dinheiro ou Cartão`
    
    return msg
  }

  // Disparar para lista de números
  async sendBulk(phones, message) {
    const results = { success: 0, failed: 0 }
    
    for (const phone of phones) {
      try {
        await axios.post(`${process.env.WHATSAPP_API_URL}/message/sendText/${process.env.WHATSAPP_INSTANCE}`, {
          number: phone,
          text: message
        }, {
          headers: { apikey: process.env.WHATSAPP_API_KEY }
        })
        results.success++
        await new Promise(r => setTimeout(r, 1500)) // delay anti-ban
      } catch {
        results.failed++
      }
    }
    
    return results
  }
}
```

### FASE 5 — Scheduler (Disparo automático diário)

```javascript
// backend/src/services/scheduler.service.js
// Dispara cardápio todo dia às 11h da manhã

cron.schedule('0 11 * * 1-6', async () => {
  // Segunda a Sábado às 11:00
  await broadcastMenuToAllCustomers()
}, { timezone: 'America/Campo_Grande' })
```

### FASE 6 — Frontend React

**Design System — Estética Clean/Elegante:**

```
Paleta de cores:
  --primary: #FF6B35      (laranja quente — comida)
  --primary-dark: #E85C2A
  --secondary: #2D3748    (cinza escuro elegante)
  --bg: #F7F8FC           (fundo off-white)
  --card: #FFFFFF
  --text: #1A202C
  --muted: #718096
  --success: #48BB78
  --warning: #ECC94B
  --danger: #F56565
  --border: #E2E8F0

Tipografia:
  Display: 'Playfair Display' (títulos elegantes)
  Body: 'DM Sans' (leitura limpa)
  Mono: 'JetBrains Mono' (números/códigos)

Componentes:
  - Cards com shadow suave + border-radius: 16px
  - Sidebar dark (#1A202C) com ícones coloridos
  - Kanban de pedidos com drag visual
  - Badges de status coloridos e animados
  - Stats cards com micro-animações
  - Tabelas com hover suave
```

**Páginas obrigatórias:**

1. **Login** — Tela elegante com logo + gradiente laranja/escuro
2. **Dashboard** — Cards de métricas (pedidos hoje, faturamento, clientes, entregas)
3. **Pedidos (Kanban)** — Colunas: Novo → Confirmado → Preparando → Pronto → Saiu → Entregue
4. **Cardápio** — Grid de marmitas com foto, preço, toggle disponível
5. **Clientes** — Tabela com histórico + botão "enviar mensagem WhatsApp"
6. **Entregadores** — Status dos entregadores Machine API em tempo real
7. **Broadcast** — Compor mensagem + selecionar lista + disparar + histórico

---

## 🔌 INTEGRAÇÃO MACHINE API (Entregas e Coletas)

**Documentação:** https://docs-api.machine.global/entregas

**Fluxo de entrega:**
```
1. Pedido criado → status: PENDING
2. Operador confirma → status: CONFIRMED  
3. Pedido em preparo → status: PREPARING
4. Pronto → status: READY
5. Clicar "Solicitar Entregador" → chama Machine API → status: DISPATCHED
6. Webhook Machine → status: DELIVERED (automático)
```

**Endpoints a integrar:**
- `POST /coletas` — criar nova entrega
- `GET /coletas/{id}` — rastrear status
- `POST /webhook` — receber atualizações automáticas da Machine

---

## 📱 FLUXO WHATSAPP AUTO-ATENDIMENTO

```
Cliente envia msg → Bot responde com cardápio
→ Cliente escolhe marmita → Bot confirma pedido
→ Bot coleta endereço → Pedido cria no sistema
→ Painel mostra novo pedido em tempo real (Socket.io)
→ Operador confirma → Bot notifica cliente
→ Entregador acionado automaticamente → Código de rastreamento enviado ao cliente
```

---

## ⚡ REAL-TIME COM SOCKET.IO

```javascript
// Eventos a implementar:
socket.on('new_order', (order) => { /* novo pedido aparece no kanban */ })
socket.on('order_updated', (order) => { /* atualiza card no kanban */ })
socket.on('delivery_status', (data) => { /* atualiza status entregador */ })
```

---

## 📦 PACKAGES NECESSÁRIOS

**Backend:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.x",
    "prisma": "^5.x",
    "dotenv": "^16.x",
    "cors": "^2.8.5",
    "helmet": "^7.x",
    "morgan": "^1.10.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "socket.io": "^4.x",
    "node-cron": "^3.x",
    "axios": "^1.x",
    "multer": "^1.x",
    "sharp": "^0.33.x"
  }
}
```

**Frontend:**
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "tailwindcss": "^3.x",
    "@tailwindcss/forms": "latest",
    "zustand": "^4.x",
    "socket.io-client": "^4.x",
    "axios": "^1.x",
    "react-query": "^5.x",
    "@tanstack/react-query": "^5.x",
    "react-hot-toast": "^2.x",
    "lucide-react": "^0.x",
    "recharts": "^2.x",
    "date-fns": "^3.x",
    "react-beautiful-dnd": "^13.x"
  }
}
```

---

## 🎨 TAILWIND CONFIG

```javascript
// frontend/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF6B35', dark: '#E85C2A', light: '#FF8C5A' },
        sidebar: '#1A202C',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px -5px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      }
    }
  }
}
```

---

## 🚦 SCRIPTS DE DESENVOLVIMENTO

```bash
# Iniciar backend
cd backend && npm run dev

# Iniciar frontend  
cd frontend && npm run dev

# Rodar migrations
cd backend && npx prisma migrate dev

# Visualizar banco
cd backend && npx prisma studio

# Seed de dados de teste
cd backend && npm run seed
```

**package.json backend:**
```json
{
  "scripts": {
    "dev": "nodemon src/app.js",
    "start": "node src/app.js",
    "seed": "node src/prisma/seed.js"
  }
}
```

---

## ✅ CHECKLIST DE DESENVOLVIMENTO

### Backend
- [ ] Setup Express + Prisma + .env
- [ ] Migrations e seed inicial
- [ ] Auth (login JWT)
- [ ] CRUD Produtos/Cardápio
- [ ] CRUD Pedidos + status
- [ ] CRUD Clientes
- [ ] Machine API service + rotas
- [ ] WhatsApp service + rotas
- [ ] Scheduler disparo diário
- [ ] Socket.io real-time
- [ ] Webhook Machine API

### Frontend
- [ ] Setup React + Vite + Tailwind
- [ ] Sistema de rotas + auth guard
- [ ] Layout (Sidebar + Header)
- [ ] Página Login
- [ ] Dashboard com métricas
- [ ] Kanban de Pedidos (real-time)
- [ ] CRUD Cardápio
- [ ] Lista de Clientes
- [ ] Painel Entregadores
- [ ] Broadcast WhatsApp
- [ ] Notificações toast

---

## 📋 PRIMEIRA MENSAGEM PARA O CLAUDE CODE

Cole isto ao abrir o Claude Code na pasta do projeto:

```
Crie o sistema completo de delivery Claudia Delivery seguindo o CLAUDE.md deste projeto.

Comece pela FASE 1:
1. Crie toda a estrutura de pastas backend/ e frontend/
2. Configure o package.json do backend com todas as dependências
3. Configure o Prisma com o schema completo do CLAUDE.md
4. Conecte ao banco PostgreSQL do Render (DATABASE_URL já está no .env que você vai criar)
5. Rode as migrations
6. Crie o seed com: 1 usuário admin, 3 categorias (Marmitas, Bebidas, Sobremesas) e 5 produtos de exemplo

Depois siga para FASE 2: construa todas as rotas do backend com controllers organizados.
```

---

*Sistema desenvolvido pela Nexus Automações Empresariais*
*Dourados, MS — 2025*
