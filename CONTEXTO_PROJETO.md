# 📋 Contexto e Handoff do Projeto: Cardápio Digital - Adega do Bairro

> **Documento de continuidade para novos chats e desenvolvedores.**  
> Última atualização: 21 de Novembro de 2026.

---

## 1. Visão Geral do Projeto
Aplicação web **mobile-first, responsiva e interativa** de um cardápio digital para a **Adega do Bairro**, projetada para permitir que clientes visualizem produtos, montem sua sacola de compras e enviem o pedido finalizado diretamente para o WhatsApp do estabelecimento.

---

## 2. Estrutura de Arquivos

```text
/mnt/500gbProM2/Antigravity/Projetos/teste1/
├── index.html               # Estrutura HTML principal (Cardápio público do cliente)
├── admin.html               # Painel Administrativo independente (com PIN 1234 e CRUD)
├── css/
│   ├── style.css            # Estilos em Dark Theme padrão do cardápio público
│   └── admin.css            # Estilos isolados do Painel Administrativo
├── js/
│   ├── data.js              # Fonte única de dados inicial (info da loja, horários, localização e produtos)
│   ├── app.js               # Lógica do cardápio público (carrinho, WhatsApp, sincronia com o Admin)
│   └── admin.js             # Lógica do Admin (Login PIN 1234, CRUD, integração Google Sheets)
├── assets/
│   └── images/              # Banner hero e fotos dos produtos (Heineken, Coca, Vinhos, Combos, etc.)
├── referencias/             # Capturas e PDF originais usados como base para o cardápio
├── README.md                # Documentação rápida de execução
└── CONTEXTO_PROJETO.md      # Este guia de continuidade
```

---

## 3. Principais Decisões e Alterações Realizadas

1. **Catálogo & Referências Oficiais:**
   - Mapeado com precisão a partir dos arquivos em `/referencias` (FireShot PDF e capturas PNG).
   - **6 Categorias Ativas:** *Importante (Aviso 18 anos)*, *Cervejas*, *Combos*, *Destilados*, *Vinhos*, *Sem álcool e gelo*.
   - **Remoção de Tabacaria:** A categoria e produtos de tabacaria foram completamente removidos a pedido do usuário.

2. **Identidade Visual e Cores:**
   - **Tema Dark Padrão:** Fundo grafite escuro (`#0b0f19`), cartões em ardósia elevada (`#131b2e`), texto em branco nítido (`#f8fafc`).
   - **Acentos em Amarelo Dourado:** Todos os botões principais, status "Aberto agora", badges, preços e checkout foram alterados do verde para amarelo vibrante/dourado (`#facc15` / `#eab308`).
   - Botão de alternância rápida de tema (🌙 / ☀️) com persistência em `localStorage`.

3. **Posicionamento e Fotos dos Produtos:**
   - As fotos foram posicionadas no **lado esquerdo** de cada cartão de produto com dimensões otimizadas (86x86px) e fundo branco limpo.
   - Vinculadas as novas fotos fornecidas pelo usuário em `assets/images/`:
     - `Fardo com 12 latas.jpg` (Heineken 12 latas)
     - `Refrigerante 2 litros.png` (Coca-Cola 2L)
     - `Vinho branco seco 750 ml.png` (Canção Branco Seco)
     - `Água tônica lata.png` (Antarctica Tônica 350ml)
     - `Gelo de coco.png` (Gelo sabor água de coco)
     - *Mais as imagens recortadas das referências originais: Cerveja lata, Combos de Vodca, Gin e Whisky, Vinho tinto seco e Gelo 5kg.*

4. **Seção de Localização da Adega:**
   - Configurada no objeto `MENU_DATA.info.location` em `js/data.js`.
   - Card interativo na página com endereço completo, ponto de referência e botões de ação:
     - **🗺️ Abrir no Google Maps**
     - **📋 Copiar Endereço** com 1 clique (com feedback visual).
   - Atalho `📍 Onde Estamos` no topo da página.
   - Exibição dinâmica do endereço de retirada dentro da Sacola ao selecionar "Retirar no Balcão".

5. **Refinamentos de Interface (Lapidações):**
   - **Abas de Categorias (Horizontal Scroll):** Corrigido o corte da aba "Vinhos" e adicionado indicador visual claro de rolagem lateral: máscaras de gradiente fade (`tabs-fade-right` / `tabs-fade-left`), seta indicadora pulsante (`›` / `‹`) e centralização automática via `scrollIntoView` ao navegar pelas seções.
   - **Barra de Rolagem no Modal:** Adicionado `color-scheme: dark` e scrollbars customizadas escuras com hover dourado, eliminando a barra clara padrão do navegador.

---

## 4. Como Executar e Testar

- **Direto pelo Navegador:** Abrir o arquivo `index.html`.
- **Servidor Local (Python):**
  ```bash
  cd /mnt/500gbProM2/Antigravity/Projetos/teste1
  python3 -m http.server 8080
  ```
  Acessar: `http://localhost:8080`

---

## 5. Módulo Administrativo & Integração Google Planilhas (admin.html)

- **Arquivo:** `admin.html`, estilizado por `css/admin.css` e gerenciado por `js/admin.js`.
- **Autenticação:** Tela de bloqueio por PIN (padrão: `1234`).
- **Operação Independente:** Não quebra o cardápio do cliente se estiver offline; se houver alterações no Admin, elas são salvas no `localStorage` do navegador e têm prioridade sobre o `data.js`.
- **Sincronização com Google Planilhas:**
  - A planilha deve ter permissão de leitura: **"Qualquer pessoa com o link"** (Leitor) ou ser publicada na Web (CSV).
  - O sistema lê automaticamente através da Google Visualization API (`gviz/tq?tqx=out:csv`), contornando restrições de CORS e redirecionamento.
  - Também suporta exportação direta para CSV clicando no botão **"📥 Exportar CSV p/ Planilha"**.

---

## 6. Próximos Passos Sugeridos para Novos Chats

- Ajustar o número de WhatsApp real da loja em `MENU_DATA.info.whatsapp` (`js/data.js`).
- Ajustar o endereço real da loja em `MENU_DATA.info.location` (`js/data.js`).
- Adicionar imagens para os produtos que ainda estão sem foto (ex: *Cerveja long neck*, *Cerveja 600ml*, *Destilados* e *Energético 2L*).
- Se necessário, configurar domínio, hospedagem estática (Vercel, Netlify, GitHub Pages) ou integração com backend de pedidos.
