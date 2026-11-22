# 📋 Contexto e Handoff do Projeto: Cardápio Digital - Adega do Bairro

> **Documento de continuidade para novos chats, desenvolvedores e manutenções futuras.**  
> Última atualização: 22 de Novembro de 2026.

---

## 1. Visão Geral do Projeto
Aplicação web **mobile-first, responsiva e de alta conversão** de um cardápio digital para a **Adega do Bairro**. Permite que clientes visualizem produtos, montem sacolas de compras com taxa de entrega ou retirada no balcão e enviem o pedido pronto e formatado diretamente para o WhatsApp do estabelecimento. Conta também com um painel administrativo independente (`admin.html`) integrado com o **Google Planilhas (Sheets)**.

- **Repositório GitHub:** `git@github.com:willianmachado/AdegaTeste.git` (Branch: `main`)
- **Hospedagem / Deploy:** Vercel (conectada via integração contínua com a branch `main` do GitHub).

---

## 2. Estrutura de Arquivos do Projeto

```text
/mnt/500gbProM2/Antigravity/Projetos/teste1/
├── index.html                   # Cardápio interativo público do cliente
├── admin.html                   # Painel Administrativo do lojista (PIN 1234)
├── planilha_cardapio_adega.csv  # Modelo oficial de planilha para importação no Google Sheets
├── css/
│   ├── style.css                # Estilos do cardápio público (Dark Theme padrão, dourado)
│   └── admin.css                # Estilos do painel administrativo
├── js/
│   ├── data.js                  # Dados base (info da loja, horários, localização e catálogo inicial)
│   ├── app.js                   # Lógica do cardápio público (sacola, WhatsApp, busca e renderização)
│   └── admin.js                 # Lógica do Admin (Login PIN, CRUD, Google Sheets JSONP/CSV, import/export)
├── assets/
│   └── images/                  # Fotos dos produtos (Cervejas, Vinhos, Combos, Gelo, etc.)
├── referencias/                 # Arquivos de referência originais (FireShot PDF e capturas PNG)
├── README.md                    # Apresentação executiva do projeto para o GitHub
└── CONTEXTO_PROJETO.md          # Este guia técnico detalhado para continuidade
```

---

## 3. Principais Funcionalidades e Decisões de Design

1. **Catálogo & Referências Oficiais:**
   - Baseado fielmente nos materiais de referência da adega.
   - **6 Categorias Ativas:** *Importante (Aviso 18 anos)*, *Cervejas*, *Combos*, *Destilados*, *Vinhos*, *Sem álcool e gelo*.
   - A categoria **Tabacaria** foi **removida** a pedido do cliente.

2. **Identidade Visual e Cores:**
   - **Tema Dark Padrão:** Fundo grafite profundo (`#0b0f19`), cartões em ardósia elevada (`#131b2e`), tipografia em branco nítido (`#f8fafc`).
   - **Acentos em Amarelo Dourado:** Todos os botões primários, tags de destaque, badges "Aberto agora" e ações de checkout usam tons dourados vibrantes (`#facc15` / `#eab308`).
   - Botão de alternância rápida de tema (🌙 / ☀️) com persistência em `localStorage`.

3. **Fotos dos Produtos no Lado Esquerdo:**
   - Cards com layout otimizado: miniatura à esquerda (86x86px com fundo neutro) e detalhes/preço/botões à direita.
   - Fotos reais adicionadas em `assets/images/` (*Heineken 12 latas*, *Coca-Cola 2L*, *Vinho Canção*, *Água tônica*, *Gelo de coco*, além dos recortes originais de cerveja lata, combos e vinhos).

4. **Seção de Localização da Loja:**
   - Card interativo com endereço, ponto de referência e raio de entrega.
   - Botões de ação rápida: **🗺️ Abrir no Google Maps** e **📋 Copiar Endereço** (com feedback visual "Copiado!").
   - Atalho no topo `📍 Onde Estamos` que desliza até o card.
   - Na sacola, ao selecionar "Retirar no Balcão", o endereço de retirada é destacado para o cliente.

5. **Lapidações de Interface:**
   - **Abas Deslizantes:** Indicadores visuais de rolagem lateral (gradientes fade e setas pulsantes) com centralização suave (`scrollIntoView`) ao navegar.
   - **Scrollbars Dark:** Eliminação da barra clara padrão do navegador nos modais.

---

## 4. Módulo Administrativo & Integração Google Planilhas (`admin.html`)

- **Autenticação:** Protegido por tela de bloqueio com senha **PIN** (padrão: `1234`).
- **Independência Operacional:** O cardápio do cliente funciona perfeitamente mesmo sem internet ou sem o painel. Se houver alterações salvas no Admin, o `localStorage['adega_admin_products']` assume a prioridade.
- **Sincronização com Google Planilhas:**
  - Suporta links de publicação: `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv`.
  - Suporta links padrão de compartilhamento: `https://docs.google.com/spreadsheets/d/ID/edit` via injeção **JSONP** (`/gviz/tq`), contornando restrições de CORS locais (`file:///`).
  - **📁 Carregar Arquivo CSV:** Botão para upload local de arquivo CSV instantâneo (sem depender de rede).
  - **📥 Exportar CSV:** Gera arquivo compatível com o Google Sheets para backup do catálogo atual.
- **Observação Importante sobre Cache do Google:** O recurso "Publicar na Web" do Google Planilhas atualiza seu link público a cada **5 minutos**. Portanto, após editar a planilha, pode haver esse intervalo até que o link do Google reflita a alteração.

---

## 5. Conexão Git, GitHub e Vercel

- **Repositório Conectado:** `git@github.com:willianmachado/AdegaTeste.git`
- **Autenticação:** SSH configurado na máquina local (`id_ed25519`).
- **Fluxo de Atualização:**
  ```bash
  git add .
  git commit -m "mensagem da alteração"
  git push origin main
  ```
- **Deploy:** A Vercel está integrada ao repositório e dispara o build/deploy automático a cada `git push`.

---

## 6. Próximos Passos Sugeridos para Próximos Chats

1. **Auto-Sync da Planilha no Cardápio do Cliente (`index.html`):**
   - Configurar para que o `index.html` busque a URL pública da planilha em segundo plano ao abrir o site, permitindo que alterações feitas na planilha reflitam para todos os clientes sem necessidade de abrir o `admin.html`.
2. **Dados Reais da Loja:**
   - Atualizar o número de WhatsApp em `MENU_DATA.info.whatsapp` (`js/data.js`).
   - Atualizar o endereço oficial em `MENU_DATA.info.location` (`js/data.js`).
3. **Fotos Faltantes:**
   - Adicionar fotos para *Cerveja long neck*, *Cerveja 600ml*, *Destilados* (Vodca, Gin, Whisky, Cachaça) e *Energético 2L*.
