# Mesa Express

Painel responsivo de demonstração para operação de delivery, construído com React, TypeScript, TanStack Start e Tailwind CSS.

## Funcionalidades do protótipo
- Cardápio por categorias, pesquisa e sacola.
- Checkout com dados do cliente, endereço, referência, forma de pagamento, troco e atendente.
- Painel de pedidos com atualização de status.
- Caixa com faturamento de pedidos entregues, ticket médio e totais por forma de pagamento.
- Configuração de taxa de entrega, preços e disponibilidade dos produtos.
- Persistência local no navegador via `localStorage`.

## Executar localmente
```bash
npm install
npm run dev
```

## Importante antes de usar comercialmente
Esta versão é um **protótipo frontend**. Os dados ficam no navegador em que foram cadastrados. Ainda não há banco de dados compartilhado, login/perfis de equipe, sincronização entre dispositivos, integração real com Pix/cartões, notificações, geolocalização ou rastreamento GPS. Para produção, implemente backend/API, banco de dados, autenticação, proteção de dados pessoais e integração com um provedor de pagamentos e mapas.

Os preços, produtos e atendentes exibidos são exemplos e devem ser ajustados nas configurações.
