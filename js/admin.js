/**
 * ==============================================================================
 * PAINEL ADMINISTRATIVO (CRUD) - ADEGA DO BAIRRO
 * Arquivo: js/admin.js
 * 
 * Este arquivo controla:
 * 1. Autenticação por PIN de segurança (padrão: 1234)
 * 2. CRUD completo de produtos (Adicionar, Listar, Editar, Excluir, Esgotar)
 * 3. Integração com Google Planilhas (importar e exportar via formato CSV)
 * 4. Persistência local em localStorage para testes imediatos
 * ==============================================================================
 */

// ==============================================================================
// BLOCO 1: CONFIGURAÇÕES E ESTADO GERAL
// ==============================================================================

// PIN de segurança para acesso ao painel (Altere aqui se desejar mudar o código)
const ADMIN_PIN = "1234";

// Chave utilizada no sessionStorage para manter o lojista conectado durante a sessão
const AUTH_STORAGE_KEY = "adega_admin_authenticated";

// Chave utilizada no localStorage para guardar os produtos salvos pelo Admin
const PRODUCTS_STORAGE_KEY = "adega_admin_products";

// Chave utilizada no localStorage para guardar a URL da planilha Google
const SHEETS_URL_KEY = "adega_sheets_csv_url";

// Estado interno do Painel Admin
const adminState = {
    products: [],          // Lista plana de produtos
    categories: [],        // Lista de categorias disponíveis
    activeCategory: "all", // Filtro ativo
    searchQuery: "",       // Termo de pesquisa
    editingItemId: null    // ID do item sendo editado (null se for criação)
};

// ==============================================================================
// BLOCO 2: INICIALIZAÇÃO DA APLICAÇÃO
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
    checkAuthentication();
    setupPinInputs();
    loadProducts();
    setupAdminEventListeners();
    setupGoogleSheetsUI();
});

// ==============================================================================
// BLOCO 3: SISTEMA DE LOGIN E SEGURANÇA (PIN 1234)
// ==============================================================================

/**
 * Verifica se o administrador já digitou o PIN nesta sessão.
 * Se já digitou, esconde a tela de login; caso contrário, exibe o teclado de PIN.
 */
function checkAuthentication() {
    const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
    const loginScreen = document.getElementById("loginScreen");

    if (isAuth === "true") {
        if (loginScreen) loginScreen.classList.add("hidden");
    } else {
        if (loginScreen) loginScreen.classList.remove("hidden");
        // Foca automaticamente no primeiro campo do PIN
        const firstPin = document.getElementById("pin1");
        if (firstPin) setTimeout(() => firstPin.focus(), 200);
    }
}

/**
 * Configura o comportamento dos 4 campos de digitação do PIN:
 * - Avança automaticamente para o próximo dígito ao digitar
 * - Volta para o anterior ao apertar Backspace
 * - Dispara a validação quando todos os 4 forem preenchidos
 */
function setupPinInputs() {
    const inputs = [
        document.getElementById("pin1"),
        document.getElementById("pin2"),
        document.getElementById("pin3"),
        document.getElementById("pin4")
    ];

    inputs.forEach((input, index) => {
        if (!input) return;

        input.addEventListener("input", (e) => {
            // Aceita apenas números
            input.value = input.value.replace(/[^0-9]/g, "");

            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Se for o último dígito, tenta autenticar automaticamente
            const fullPin = inputs.map(i => i.value).join("");
            if (fullPin.length === 4) {
                validatePin(fullPin);
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Botão de Entrar
    const btnSubmit = document.getElementById("btnLoginSubmit");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", () => {
            const fullPin = inputs.map(i => i ? i.value : "").join("");
            validatePin(fullPin);
        });
    }
}

/**
 * Valida o PIN inserido com o código mestre (ADMIN_PIN = "1234")
 */
function validatePin(enteredPin) {
    const errorMsg = document.getElementById("loginErrorMsg");

    if (enteredPin === ADMIN_PIN) {
        // Sucesso: marca a sessão e libera o painel
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
        const loginScreen = document.getElementById("loginScreen");
        if (loginScreen) loginScreen.classList.add("hidden");
        if (errorMsg) errorMsg.textContent = "";
    } else {
        // Erro: exibe mensagem e limpa os campos
        if (errorMsg) errorMsg.textContent = "PIN incorreto! Tente novamente.";
        [1, 2, 3, 4].forEach(n => {
            const el = document.getElementById(`pin${n}`);
            if (el) el.value = "";
        });
        const first = document.getElementById("pin1");
        if (first) first.focus();
    }
}

/**
 * Função para desconectar e bloquear o painel
 */
function logoutAdmin() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.reload();
}

// ==============================================================================
// BLOCO 4: CARREGAMENTO E SINCRONIZAÇÃO DE PRODUTOS
// ==============================================================================

/**
 * Carrega a lista de produtos:
 * 1. Primeiro tenta ler do localStorage (alterações feitas pelo Admin)
 * 2. Se estiver vazio, importa a lista padrão que já existe no MENU_DATA (data.js)
 */
function loadProducts() {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);

    if (saved) {
        try {
            adminState.products = JSON.parse(saved);
        } catch (e) {
            console.error("Erro ao ler produtos do localStorage", e);
            adminState.products = extractDefaultProducts();
        }
    } else {
        // Extrai os produtos existentes do MENU_DATA original
        adminState.products = extractDefaultProducts();
        saveProductsToLocal();
    }

    extractCategories();
    renderCategoryFilterTabs();
    renderProductsList();
    updateMetrics();
}

/**
 * Converte a estrutura aninhada de categorias do MENU_DATA em uma lista plana de produtos
 */
function extractDefaultProducts() {
    if (typeof MENU_DATA === "undefined" || !MENU_DATA.categories) {
        return [];
    }

    const flatList = [];
    MENU_DATA.categories.forEach(cat => {
        cat.items.forEach(item => {
            if (!item.isNotice) {
                flatList.push({
                    id: item.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                    category: cat.title,
                    title: item.title,
                    description: item.description || "",
                    price: parseFloat(item.price) || 0,
                    image: item.image || "",
                    popular: !!item.popular,
                    status: "disponivel" // "disponivel" ou "esgotado"
                });
            }
        });
    });
    return flatList;
}

/**
 * Salva a lista de produtos atualizada no localStorage
 */
function saveProductsToLocal() {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(adminState.products));
    updateMetrics();
}

/**
 * Extrai a lista única de categorias presentes nos produtos cadastrados
 */
function extractCategories() {
    const cats = new Set();
    adminState.products.forEach(p => {
        if (p.category) cats.add(p.category.trim());
    });
    adminState.categories = Array.from(cats);
}

// ==============================================================================
// BLOCO 5: RENDERIZAÇÃO DA INTERFACE DO CRUD
// ==============================================================================

/**
 * Atualiza os cards de métricas no topo do painel
 */
function updateMetrics() {
    const totalEl = document.getElementById("metricTotal");
    const activeEl = document.getElementById("metricActive");
    const soldoutEl = document.getElementById("metricSoldOut");
    const catsEl = document.getElementById("metricCats");

    const total = adminState.products.length;
    const soldOut = adminState.products.filter(p => p.status === "esgotado").length;
    const active = total - soldOut;
    const cats = adminState.categories.length;

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (soldoutEl) soldoutEl.textContent = soldOut;
    if (catsEl) catsEl.textContent = cats;
}

/**
 * Renderiza as abas de filtro por categoria no admin
 */
function renderCategoryFilterTabs() {
    const container = document.getElementById("categoryFilterTabs");
    if (!container) return;

    let html = `<button class="filter-tab ${adminState.activeCategory === 'all' ? 'active' : ''}" data-cat="all">Todos (${adminState.products.length})</button>`;

    adminState.categories.forEach(cat => {
        const count = adminState.products.filter(p => p.category === cat).length;
        const isActive = adminState.activeCategory === cat ? 'active' : '';
        html += `<button class="filter-tab ${isActive}" data-cat="${cat}">${cat} (${count})</button>`;
    });

    container.innerHTML = html;

    container.querySelectorAll(".filter-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            adminState.activeCategory = btn.dataset.cat;
            renderCategoryFilterTabs();
            renderProductsList();
        });
    });
}

/**
 * Renderiza a lista de produtos no painel
 */
function renderProductsList() {
    const container = document.getElementById("adminProductsList");
    if (!container) return;

    const query = adminState.searchQuery.toLowerCase().trim();

    // Filtra por busca e categoria
    const filtered = adminState.products.filter(item => {
        const matchesCategory = adminState.activeCategory === "all" || item.category === adminState.activeCategory;
        const matchesSearch = !query || 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
                <p style="font-size: 2rem; margin-bottom: 8px;">📦</p>
                <h3>Nenhum produto encontrado</h3>
                <p style="font-size: 0.85rem; margin-top: 4px;">Clique em "+ Adicionar Produto" para criar um novo.</p>
            </div>
        `;
        return;
    }

    let html = "";
    filtered.forEach(item => {
        const isSoldOut = item.status === "esgotado";
        const formattedPrice = (item.price || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        html += `
            <div class="admin-item-card ${isSoldOut ? 'sold-out' : ''}" id="admin-item-${item.id}">
                <div class="item-left-col">
                    ${item.image ? `
                        <img src="${encodeURI(item.image)}" alt="${item.title}" class="item-img-admin" onerror="this.src=''; this.className='item-img-placeholder'; this.innerHTML='🍺';" />
                    ` : `
                        <div class="item-img-placeholder">🍺</div>
                    `}
                    <div class="item-meta-admin">
                        <span class="item-category-tag">${item.category || 'Geral'}</span>
                        <div class="item-name-admin">
                            ${item.title}
                            ${item.popular ? '<span style="color:#facc15; font-size:0.75rem; margin-left:4px;">★ Destaque</span>' : ''}
                        </div>
                        <div class="item-desc-admin">${item.description || 'Sem descrição'}</div>
                        <div class="item-price-admin">${formattedPrice}</div>
                    </div>
                </div>

                <div class="item-actions-admin">
                    <!-- Botão de alternar Disponível / Esgotado -->
                    <button class="btn-status-toggle ${isSoldOut ? 'soldout' : 'available'}" onclick="toggleProductStatus('${item.id}')" title="Clique para alternar status">
                        ${isSoldOut ? '🔴 Esgotado' : '🟢 Disponível'}
                    </button>

                    <!-- Botão Editar -->
                    <button class="btn-edit-admin" onclick="openEditProductModal('${item.id}')">
                        ✏️ Editar
                    </button>

                    <!-- Botão Excluir -->
                    <button class="btn-delete-admin" onclick="deleteProduct('${item.id}')" title="Excluir produto">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==============================================================================
// BLOCO 6: OPERAÇÕES DO CRUD (CRIAR, EDITAR, STATUS, EXCLUIR)
// ==============================================================================

/**
 * Alterna rapidamente o status do produto entre "disponivel" e "esgotado"
 */
function toggleProductStatus(id) {
    const item = adminState.products.find(p => p.id === id);
    if (!item) return;

    item.status = item.status === "esgotado" ? "disponivel" : "esgotado";
    saveProductsToLocal();
    renderProductsList();
    updateMetrics();
}

/**
 * Abre o modal para ADICIONAR um novo produto
 */
function openAddProductModal() {
    adminState.editingItemId = null;
    document.getElementById("modalProductTitle").textContent = "Adicionar Novo Produto";
    
    // Limpa o formulário
    document.getElementById("formItemTitle").value = "";
    document.getElementById("formItemCategory").value = adminState.categories[0] || "Cervejas";
    document.getElementById("formItemPrice").value = "";
    document.getElementById("formItemDesc").value = "";
    document.getElementById("formItemImage").value = "";
    document.getElementById("formItemStatus").value = "disponivel";
    document.getElementById("formItemPopular").checked = false;

    populateCategoryDatalist();
    document.getElementById("productModalOverlay").classList.add("active");
}

/**
 * Abre o modal para EDITAR um produto existente
 */
function openEditProductModal(id) {
    const item = adminState.products.find(p => p.id === id);
    if (!item) return;

    adminState.editingItemId = id;
    document.getElementById("modalProductTitle").textContent = "Editar Produto";

    // Preenche com os dados do item
    document.getElementById("formItemTitle").value = item.title || "";
    document.getElementById("formItemCategory").value = item.category || "";
    document.getElementById("formItemPrice").value = item.price !== undefined ? item.price : "";
    document.getElementById("formItemDesc").value = item.description || "";
    document.getElementById("formItemImage").value = item.image || "";
    document.getElementById("formItemStatus").value = item.status || "disponivel";
    document.getElementById("formItemPopular").checked = !!item.popular;

    populateCategoryDatalist();
    document.getElementById("productModalOverlay").classList.add("active");
}

/**
 * Preenche a lista de sugestões de categorias no campo de categoria
 */
function populateCategoryDatalist() {
    const datalist = document.getElementById("categoriesDatalist");
    if (!datalist) return;

    datalist.innerHTML = adminState.categories.map(c => `<option value="${c}">`).join("");
}

/**
 * Salva o formulário (Criar ou Atualizar)
 */
function handleProductFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("formItemTitle").value.trim();
    const category = document.getElementById("formItemCategory").value.trim();
    const priceStr = document.getElementById("formItemPrice").value.replace(",", ".");
    const price = parseFloat(priceStr) || 0;
    const description = document.getElementById("formItemDesc").value.trim();
    const image = document.getElementById("formItemImage").value.trim();
    const status = document.getElementById("formItemStatus").value;
    const popular = document.getElementById("formItemPopular").checked;

    if (!title || !category) {
        alert("Por favor, preencha o Nome e a Categoria do produto.");
        return;
    }

    if (adminState.editingItemId) {
        // ATUALIZAÇÃO (EDIT)
        const item = adminState.products.find(p => p.id === adminState.editingItemId);
        if (item) {
            item.title = title;
            item.category = category;
            item.price = price;
            item.description = description;
            item.image = image;
            item.status = status;
            item.popular = popular;
        }
    } else {
        // CRIAÇÃO (CREATE)
        const newItem = {
            id: `prod_${Date.now()}`,
            title,
            category,
            price,
            description,
            image,
            status,
            popular
        };
        adminState.products.unshift(newItem);
    }

    saveProductsToLocal();
    extractCategories();
    renderCategoryFilterTabs();
    renderProductsList();
    closeProductModal();
}

/**
 * Fecha o modal de formulário
 */
function closeProductModal() {
    document.getElementById("productModalOverlay").classList.remove("active");
}

/**
 * Exclui um produto após confirmação
 */
function deleteProduct(id) {
    const item = adminState.products.find(p => p.id === id);
    if (!item) return;

    const confirmDelete = confirm(`Deseja realmente excluir o produto:\n"${item.title}"?`);
    if (confirmDelete) {
        adminState.products = adminState.products.filter(p => p.id !== id);
        saveProductsToLocal();
        extractCategories();
        renderCategoryFilterTabs();
        renderProductsList();
    }
}

// ==============================================================================
// BLOCO 7: INTEGRAÇÃO COM GOOGLE PLANILHAS (LEITURA E EXPORTAÇÃO CSV)
// ==============================================================================

/**
 * Configura o campo de URL da Planilha Google e o upload de arquivo CSV
 */
function setupGoogleSheetsUI() {
    const urlInput = document.getElementById("sheetsUrlInput");
    const savedUrl = localStorage.getItem(SHEETS_URL_KEY);

    if (urlInput && savedUrl) {
        urlInput.value = savedUrl;
    }

    const btnSync = document.getElementById("btnSyncSheets");
    if (btnSync) {
        btnSync.addEventListener("click", syncWithGoogleSheets);
    }

    const btnExport = document.getElementById("btnExportSheets");
    if (btnExport) {
        btnExport.addEventListener("click", exportProductsToCSV);
    }

    // Configuração do botão de carregar arquivo CSV direto do computador
    const btnUpload = document.getElementById("btnUploadCsv");
    const fileInput = document.getElementById("csvFileInput");
    if (btnUpload && fileInput) {
        btnUpload.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", handleCsvFileUpload);
    }
}

/**
 * Lê diretamente um arquivo CSV selecionado pelo usuário no computador (sem problemas de CORS/internet)
 */
function handleCsvFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const parsedProducts = parseGoogleSheetsCSV(csvText);

            if (parsedProducts.length === 0) {
                alert("Aviso: Nenhum produto válido foi identificado nas linhas do arquivo selecionado.");
                return;
            }

            adminState.products = parsedProducts;
            saveProductsToLocal();
            extractCategories();
            renderCategoryFilterTabs();
            renderProductsList();

            alert(`✓ Sucesso! ${parsedProducts.length} produtos carregados diretamente do arquivo "${file.name}"!`);
        } catch (err) {
            console.error("Erro ao processar arquivo CSV:", err);
            alert("Erro ao ler o arquivo CSV. Verifique se o arquivo segue o modelo padrão da adega.");
        }
    };

    reader.onerror = function() {
        alert("Erro ao ler o arquivo do seu computador.");
    };

    reader.readAsText(file, "UTF-8");
    // Limpa o valor para permitir selecionar o mesmo arquivo novamente
    event.target.value = "";
}

/**
 * Carrega os dados da planilha usando JSONP (<script>), contornando 100% dos bloqueios de CORS e 'file:///'
 */
function fetchGoogleSheetsJSONP(sheetId) {
    return new Promise((resolve, reject) => {
        const callbackName = 'gvizCallback_' + Math.floor(Math.random() * 1000000);
        const script = document.createElement('script');
        
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error("Tempo esgotado ao buscar dados via JSONP."));
        }, 10000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        }

        window[callbackName] = function(data) {
            cleanup();
            try {
                if (!data || !data.table || !data.table.rows) {
                    throw new Error("Formato de dados inválido retornado pelo Google.");
                }

                const products = [];
                const rows = data.table.rows;

                rows.forEach((row, i) => {
                    const c = row.c || [];
                    const category = (c[0] && c[0].v !== null) ? String(c[0].v).trim() : "Geral";
                    const title = (c[1] && c[1].v !== null) ? String(c[1].v).trim() : "";
                    const description = (c[2] && c[2].v !== null) ? String(c[2].v).trim() : "";
                    
                    let priceVal = (c[3] && c[3].v !== null) ? c[3].v : 0;
                    if (typeof priceVal === 'string') {
                        priceVal = parseFloat(priceVal.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
                    }

                    const image = (c[4] && c[4].v !== null) ? String(c[4].v).trim() : "";
                    const statusText = (c[5] && c[5].v !== null) ? String(c[5].v).toLowerCase().trim() : "disponivel";
                    const status = statusText.includes("esgot") ? "esgotado" : "disponivel";
                    const popularText = (c[6] && c[6].v !== null) ? String(c[6].v).toLowerCase().trim() : "";
                    const popular = popularText.includes("sim");

                    // Ignora se for linha de cabeçalho repetida
                    if (title && title.toLowerCase() !== "produto" && title.toLowerCase() !== "nome") {
                        products.push({
                            id: `sheet_item_${i + 1}`,
                            category,
                            title,
                            description,
                            price: Number(priceVal) || 0,
                            image,
                            status,
                            popular
                        });
                    }
                });

                resolve(products);
            } catch (err) {
                reject(err);
            }
        };

        script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}`;
        script.onerror = function() {
            cleanup();
            reject(new Error("Erro ao carregar dados do Google Sheets via script."));
        };

        document.body.appendChild(script);
    });
}

/**
 * Sincroniza e importa os dados diretamente da URL pública do Google Sheets (formato CSV ou JSONP)
 */
async function syncWithGoogleSheets() {
    const urlInput = document.getElementById("sheetsUrlInput");
    const rawUrl = urlInput ? urlInput.value.trim() : "";

    if (!rawUrl) {
        alert("Por favor, cole a URL da sua Planilha Google!");
        return;
    }

    const btnSync = document.getElementById("btnSyncSheets");
    const originalText = btnSync ? btnSync.innerHTML : "";
    if (btnSync) btnSync.innerHTML = "⏳ Sincronizando...";

    // 1. TENTA PRIMEIRO VIA JSONP SE FOR LINK NORMAL DO GOOGLE SHEETS (/d/ID_PLANILHA/...)
    // JSONP funciona perfeitamente mesmo abrindo via file:/// (sem erros de CORS!)
    const normalMatch = rawUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (normalMatch && normalMatch[1] !== "e") {
        const sheetId = normalMatch[1];
        try {
            console.log("Tentando sincronização via JSONP para Sheet ID:", sheetId);
            const jsonpProducts = await fetchGoogleSheetsJSONP(sheetId);
            if (jsonpProducts && jsonpProducts.length > 0) {
                adminState.products = jsonpProducts;
                localStorage.setItem(SHEETS_URL_KEY, rawUrl);
                saveProductsToLocal();
                extractCategories();
                renderCategoryFilterTabs();
                renderProductsList();

                alert(`✓ Sucesso! ${jsonpProducts.length} produtos sincronizados da sua Planilha Google!`);
                if (btnSync) btnSync.innerHTML = originalText;
                return;
            }
        } catch (jsonpErr) {
            console.warn("JSONP falhou, tentando URLs diretas de exportação...", jsonpErr);
        }
    }

    // 2. CASO SEJA LINK PUBLICADO NA WEB (/d/e/2PACX-...) OU OUTRAS URLs
    let candidateUrls = [];

    const pubMatch = rawUrl.match(/\/d\/e\/(2PACX-[a-zA-Z0-9-_]+)/);
    if (pubMatch) {
        const pubId = pubMatch[1];
        const directCsv = `https://docs.google.com/spreadsheets/d/e/${pubId}/pub?output=csv`;
        candidateUrls.push(directCsv);
        candidateUrls.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(directCsv)}`);
        candidateUrls.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(directCsv)}`);
    } else if (rawUrl.includes("/pub")) {
        const cleanBase = rawUrl.split("?")[0].replace(/\/pubhtml$/, "/pub");
        const directCsv = cleanBase.endsWith("/pub") ? `${cleanBase}?output=csv` : `${cleanBase}/pub?output=csv`;
        candidateUrls.push(directCsv);
        candidateUrls.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(directCsv)}`);
    }

    if (normalMatch && normalMatch[1] !== "e") {
        const sheetId = normalMatch[1];
        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        candidateUrls.push(exportUrl);
        candidateUrls.push(`https://api.allorigins.win/raw?url=${encodeURIComponent(exportUrl)}`);
        candidateUrls.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(exportUrl)}`);
    }

    if (candidateUrls.length === 0) {
        candidateUrls.push(rawUrl);
    }

    let success = false;
    let lastError = null;

    for (const url of candidateUrls) {
        try {
            console.log("Tentando carregar dados de:", url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const csvText = await response.text();
            
            if (csvText.includes("<!DOCTYPE html") || csvText.includes("<html") || csvText.includes("accounts.google.com")) {
                throw new Error("Acesso negado: a planilha retornou tela de login.");
            }

            const parsedProducts = parseGoogleSheetsCSV(csvText);

            if (parsedProducts.length === 0) {
                throw new Error("Nenhum produto válido encontrado no CSV.");
            }

            adminState.products = parsedProducts;
            localStorage.setItem(SHEETS_URL_KEY, rawUrl);
            saveProductsToLocal();
            extractCategories();
            renderCategoryFilterTabs();
            renderProductsList();

            alert(`✓ Sucesso! ${parsedProducts.length} produtos sincronizados da sua Planilha Google!`);
            success = true;
            break;
        } catch (err) {
            console.warn("Tentativa falhou para:", url, err);
            lastError = err;
        }
    }

    if (!success) {
        console.error("Falha geral ao sincronizar planilha:", lastError);
        alert(
            "⚠️ O navegador bloqueou a requisição externa por estar abrindo o arquivo localmente (file:///).\n\n" +
            "USE A OPÇÃO RECOMENDADA (Instantânea):\n" +
            "👉 Clique no botão '📁 Carregar Arquivo CSV' no topo do painel e selecione o arquivo 'planilha_cardapio_adega.csv'!\n\n" +
            "Quando o site for publicado na Vercel ou hospedagem oficial (com endereço http://...), a sincronização por link funcionará perfeitamente!"
        );
    }

    if (btnSync) btnSync.innerHTML = originalText;
}

/**
 * Converte o texto CSV recebido do Google Sheets em lista de objetos de produto
 * Espera as colunas: Categoria, Produto, Descrição, Preço, Foto, Status, Destaque
 */
function parseGoogleSheetsCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Detecta se o separador é vírgula ou ponto e vírgula
    const delimiter = (lines[0].includes(";") && !lines[0].includes(",")) ? ";" : ",";

    // Linha 0 contém o cabeçalho
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        // Separa colunas respeitando aspas
        const cols = parseCSVLine(lines[i], delimiter);
        if (cols.length < 2) continue;

        const category = cols[0] ? cols[0].trim() : "Geral";
        const title = cols[1] ? cols[1].trim() : "";
        const description = cols[2] ? cols[2].trim() : "";
        const priceClean = cols[3] ? cols[3].replace("R$", "").replace(/\./g, "").replace(",", ".").trim() : "0";
        const price = parseFloat(priceClean) || 0;
        const image = cols[4] ? cols[4].trim() : "";
        const statusText = cols[5] ? cols[5].toLowerCase().trim() : "disponivel";
        const status = statusText.includes("esgot") ? "esgotado" : "disponivel";
        const popular = cols[6] ? cols[6].toLowerCase().includes("sim") : false;

        if (title) {
            products.push({
                id: `sheet_item_${i}`,
                category,
                title,
                description,
                price,
                image,
                status,
                popular
            });
        }
    }

    return products;
}

/**
 * Função utilitária para dividir uma linha de CSV respeitando valores entre aspas
 */
function parseCSVLine(line, delimiter = ',') {
    const result = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i++; // pula aspa dupla escapada
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === delimiter && !inQuotes) {
            result.push(cur.trim());
            cur = "";
        } else {
            cur += c;
        }
    }
    result.push(cur.trim());
    return result;
}

/**
 * Exporta os produtos cadastrados no formato CSV ideal para colar ou importar no Google Planilhas
 */
function exportProductsToCSV() {
    const headers = ["Categoria", "Produto", "Descrição", "Preço", "Foto", "Status", "Destaque"];
    const rows = [headers.join(",")];

    adminState.products.forEach(p => {
        const row = [
            `"${(p.category || '').replace(/"/g, '""')}"`,
            `"${(p.title || '').replace(/"/g, '""')}"`,
            `"${(p.description || '').replace(/"/g, '""')}"`,
            (p.price || 0).toFixed(2),
            `"${(p.image || '').replace(/"/g, '""')}"`,
            p.status === "esgotado" ? "Esgotado" : "Disponível",
            p.popular ? "Sim" : "Não"
        ];
        rows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `cardapio_adega_planilha_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==============================================================================
// BLOCO 8: EVENT LISTENERS E CONFIGURAÇÕES GERAIS
// ==============================================================================
function setupAdminEventListeners() {
    // Busca em tempo real no admin
    const searchInput = document.getElementById("adminSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            adminState.searchQuery = e.target.value;
            renderProductsList();
        });
    }

    // Botão Adicionar Produto
    const btnAdd = document.getElementById("btnOpenAddModal");
    if (btnAdd) {
        btnAdd.addEventListener("click", openAddProductModal);
    }

    // Fechar Modal
    const btnClose = document.getElementById("btnCloseModal");
    const btnCancel = document.getElementById("btnCancelModal");
    [btnClose, btnCancel].forEach(b => {
        if (b) b.addEventListener("click", closeProductModal);
    });

    // Submissão do Formulário
    const form = document.getElementById("productFormAdmin");
    if (form) {
        form.addEventListener("submit", handleProductFormSubmit);
    }

    // Botão de Logout
    const btnLogout = document.getElementById("btnLogoutAdmin");
    if (btnLogout) {
        btnLogout.addEventListener("click", logoutAdmin);
    }

    // Fechar modal ao clicar fora
    const overlay = document.getElementById("productModalOverlay");
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeProductModal();
        });
    }
}
