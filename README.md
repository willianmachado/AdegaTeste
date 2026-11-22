# 🍷 Adega do Bairro - Cardápio Digital & Painel Administrativo

Cardápio digital mobile-first, rápido e elegante para adegas, distribuidoras de bebidas e lojas de conveniência. O projeto permite que clientes façam pedidos diretamente pelo WhatsApp e que o lojista gerencie todo o catálogo de produtos de forma simples — seja pelo painel administrativo com senha PIN ou sincronizando diretamente com uma **Planilha Google**.

---

## 📱 O que é o Projeto?

Uma solução completa de cardápio online com foco em alta conversão e facilidade de uso para clientes e comerciantes:

- **Experiência do Cliente (`index.html`):**
  - Design moderno com **Tema Dark** e acentos em amarelo dourado.
  - Navegação intuitiva com abas de categorias deslizantes.
  - Produtos organizados com fotos, descrições, preços e tags de destaque.
  - Sacola de compras flutuante com cálculo automático de subtotal e taxa de entrega.
  - Opção de **Entrega (Delivery)** ou **Retirada no Balcão**.
  - Finalização de pedido com 1 clique enviando mensagem pronta e formatada para o **WhatsApp** da adega.
  - Informações de horário de funcionamento (status aberto/fechado dinâmico) e card de localização com link do Google Maps e botão de copiar endereço.

- **Painel Administrativo (`admin.html`):**
  - Tela de acesso protegida por senha **PIN** (padrão: `1234`).
  - Gestão de produtos (adicionar, editar preço, marcar como esgotado ou excluir).
  - **Sincronização com Google Planilhas (Sheets):** permite que pessoas sem conhecimento de sistema atualizem preços e produtos direto de uma planilha comum.
  - Suporte a **Importação e Exportação de arquivos CSV**.

---

## 🛠️ Como foi Feito?

O projeto foi desenvolvido priorizando **simplicidade, performance extrema e custo zero de hospedagem**:

- **Linguagens e Tecnologias:**
  - **HTML5 Semântico:** Estrutura limpa, acessível e otimizada para SEO local.
  - **CSS3 Moderno:** Variáveis CSS (design tokens), Flexbox, CSS Grid, scrollbars estilizadas e suporte nativo a temas escuros.
  - **JavaScript Vanilla (ES6+):** Código puro sem dependências pesadas ou frameworks (sem React, Vue ou Angular), garantindo carregamento instantâneo em qualquer celular ou conexão 4G/3G.

- **Arquitetura & Persistência de Dados:**
  - **`data.js`:** Base padrão de dados com informações da loja, horários e produtos iniciais.
  - **`localStorage`:** Persistência no navegador para armazenar as alterações feitas no painel administrativo sem necessidade de banco de dados pago.
  - **Google Sheets API / JSONP:** Leitura de dados remota para atualização via planilha sem custos de servidor.

- **Hospedagem & Deploy:**
  - Arquitetura 100% estática (Jamstack), pronta para rodar gratuitamente na **Vercel**, **Netlify** ou **GitHub Pages**.
  - Integração contínua: qualquer atualização enviada para a branch `main` do GitHub atualiza o site no ar automaticamente.

---

## 📂 Estrutura de Pastas

```text
├── index.html                   # Cardápio interativo do cliente
├── admin.html                   # Painel administrativo do lojista
├── planilha_cardapio_adega.csv  # Modelo de planilha pronto para o Google Sheets
├── css/
│   ├── style.css                # Estilos do cardápio do cliente
│   └── admin.css                # Estilos do painel administrativo
├── js/
│   ├── app.js                   # Lógica da sacola, status e pedidos via WhatsApp
│   ├── admin.js                 # Lógica do CRUD, PIN e sincronização Google Sheets
│   └── data.js                  # Dados padrão da loja, categorias e produtos
├── assets/
│   └── images/                  # Fotos dos produtos da adega
└── referencias/                 # Documentos de apoio e briefing inicial
```

---

## 🚀 Como Rodar Localmente

Basta clonar o repositório e abrir o `index.html` ou iniciar um servidor estático simples:

```bash
# Iniciar servidor local com Python
python3 -m http.server 8080
```

- **Cardápio do Cliente:** `http://localhost:8080`
- **Painel de Gestão:** `http://localhost:8080/admin.html` (PIN padrão: `1234`)
