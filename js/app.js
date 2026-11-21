/**
 * Cardápio Digital - Lógica de Aplicação
 * Adega do Bairro
 */

// Estado da Aplicação
const state = {
    cart: {}, // { itemId: quantity }
    activeCategory: 'all',
    searchQuery: '',
    deliveryType: 'delivery', // 'delivery' | 'pickup'
    paymentMethod: 'pix', // 'pix' | 'card' | 'money'
    deliveryAddress: {
        street: '',
        number: '',
        neighborhood: '',
        complement: ''
    },
    customerName: '',
    changeFor: '',
    notes: '',
    manageMode: false,
    theme: localStorage.getItem('adega_theme') || 'dark',
    soldOutItems: JSON.parse(localStorage.getItem('adega_sold_out') || '[]'),
    customPrices: JSON.parse(localStorage.getItem('adega_custom_prices') || '{}')
};

// Formatação de Moeda
function formatCurrency(val) {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBusinessHours();
    renderTabs();
    renderMenu();
    renderLocationCard();
    setupEventListeners();
    updateCartUI();
});

// Gerenciamento de Tema (Dark / Light)
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
}

function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('adega_theme', state.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.getElementById('btnThemeToggle');
    if (btn) {
        btn.textContent = state.theme === 'dark' ? '🌙' : '☀️';
        btn.title = state.theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
    }
}

// Verificação dinâmica de horário de funcionamento
function initBusinessHours() {
    const now = new Date();
    const day = now.getDay(); // 0: Dom, 1: Seg, ..., 6: Sáb
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + minute / 60;

    let isOpen = false;
    let todayHoursText = '';

    // Seg a Qui (1, 2, 3, 4): 16h às 0h (24h)
    // Sex e Sáb (5, 6): 16h às 2h (da madrugada seguinte)
    // Dom (0): 14h às 22h
    if (day >= 1 && day <= 4) {
        isOpen = currentTime >= 16;
        todayHoursText = "Hoje: 16h às 00h";
    } else if (day === 5 || day === 6) {
        isOpen = currentTime >= 16 || currentTime < 2;
        todayHoursText = "Hoje: 16h às 02h";
    } else if (day === 0) {
        isOpen = currentTime >= 14 && currentTime < 22;
        todayHoursText = "Hoje: 14h às 22h";
    }

    const badge = document.getElementById('statusBadge');
    if (badge) {
        if (isOpen) {
            badge.className = 'status-badge status-open';
            badge.innerHTML = `<span class="status-dot pulse"></span> Aberto agora • ${todayHoursText}`;
        } else {
            badge.className = 'status-badge status-closed';
            badge.innerHTML = `<span class="status-dot"></span> Fechado agora • ${todayHoursText}`;
        }
    }
}

// Renderiza a seção de Localização da Loja
function renderLocationCard() {
    const loc = MENU_DATA.info.location;
    const addressBox = document.getElementById('locationCardAddress');
    const mapsBtn = document.getElementById('btnLocationMaps');

    if (addressBox) {
        addressBox.innerHTML = `
            <div class="location-address-text">
                <strong>${loc.street}, ${loc.number}</strong> - ${loc.neighborhood}<br>
                <span>${loc.city} - ${loc.state} • CEP: ${loc.cep}</span>
                <span class="location-ref-text">📍 ${loc.reference}</span>
            </div>
            <div class="location-badges">
                <span class="loc-badge">🛵 ${loc.deliveryRadius}</span>
                <span class="loc-badge">🛍️ Retirada Grátis no Balcão</span>
            </div>
        `;
    }

    if (mapsBtn && loc.googleMapsUrl) {
        mapsBtn.href = loc.googleMapsUrl;
    }

    // Modal de Info também
    const modalLocBox = document.getElementById('modalLocationBox');
    if (modalLocBox) {
        modalLocBox.innerHTML = `
            <strong>${loc.street}, ${loc.number}</strong> - ${loc.neighborhood}<br>
            <span>${loc.city} - ${loc.state}</span>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">${loc.reference}</div>
        `;
    }
}

// Copiar endereço da loja
function copyStoreAddress() {
    const loc = MENU_DATA.info.location;
    const textToCopy = `${loc.street}, ${loc.number} - ${loc.neighborhood}, ${loc.city} - ${loc.state} (CEP: ${loc.cep})`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const btn = document.getElementById('btnCopyAddress');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Copiado!';
            btn.style.color = 'var(--accent-primary)';
            btn.style.borderColor = 'var(--accent-primary)';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        }
    }).catch(() => {
        alert(textToCopy);
    });
}

// Rolar até o cartão de localização
function scrollToLocation() {
    const card = document.getElementById('storeLocationCard');
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transform = 'scale(1.02)';
        card.style.borderColor = 'var(--accent-primary)';
        card.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            card.style.transform = 'none';
        }, 600);
    }
}

// Função que retorna as categorias ativas (priorizando itens do Admin/localStorage se existirem)
function getActiveCategories() {
    const saved = localStorage.getItem('adega_admin_products');
    if (!saved) return MENU_DATA.categories;

    try {
        const flatProducts = JSON.parse(saved);
        if (!Array.isArray(flatProducts) || flatProducts.length === 0) {
            return MENU_DATA.categories;
        }

        const avisoCategory = MENU_DATA.categories.find(c => c.id === 'importante') || {
            id: 'importante',
            title: 'Importante',
            badge: 'Aviso Legal',
            items: [{
                id: 'aviso-18',
                title: 'Proibida a venda para menores de 18 anos',
                description: 'Bebida alcoólica só para maiores de 18 anos (Lei 13.106/2015). Podemos pedir documento com foto na entrega.',
                price: 0,
                isNotice: true
            }]
        };

        const grouped = {};
        flatProducts.forEach(prod => {
            const catName = prod.category || 'Geral';
            if (!grouped[catName]) grouped[catName] = [];
            grouped[catName].push({
                id: prod.id,
                title: prod.title,
                description: prod.description || '',
                price: parseFloat(prod.price) || 0,
                image: prod.image || null,
                popular: !!prod.popular,
                status: prod.status || 'disponivel'
            });
        });

        const result = [avisoCategory];
        Object.entries(grouped).forEach(([catTitle, items]) => {
            const catId = catTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
            result.push({
                id: catId,
                title: catTitle,
                badge: `${items.length} itens`,
                items: items
            });
        });

        return result;
    } catch (e) {
        return MENU_DATA.categories;
    }
}

// Renderiza as abas de categorias
function renderTabs() {
    const tabsContainer = document.getElementById('tabsScroll');
    if (!tabsContainer) return;

    let html = `<button class="tab-btn active" data-cat="all">Todos</button>`;
    
    const categories = getActiveCategories();
    categories.forEach(cat => {
        html += `<button class="tab-btn" data-cat="${cat.id}">${cat.title}</button>`;
    });

    tabsContainer.innerHTML = html;

    // Eventos de clique nas abas
    tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            
            const catId = btn.dataset.cat;
            if (catId === 'all') {
                window.scrollTo({ top: document.getElementById('menuContent').offsetTop - 60, behavior: 'smooth' });
            } else {
                const el = document.getElementById(`category-${catId}`);
                if (el) {
                    const y = el.getBoundingClientRect().top + window.pageYOffset - 60;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        });
    });
}

// Renderiza o Cardápio Completo (COM FOTOS À ESQUERDA)
function renderMenu() {
    const menuContent = document.getElementById('menuContent');
    if (!menuContent) return;

    const query = state.searchQuery.toLowerCase().trim();
    let totalItemsFound = 0;

    let html = '';

    const categories = getActiveCategories();
    categories.forEach(cat => {
        // Filtra itens por busca
        const filteredItems = cat.items.filter(item => {
            if (!query) return true;
            return item.title.toLowerCase().includes(query) || 
                   item.description.toLowerCase().includes(query);
        });

        if (filteredItems.length === 0) return;
        totalItemsFound += filteredItems.length;

        html += `
            <section class="category-section" id="category-${cat.id}">
                <div class="category-header">
                    <h2 class="category-title">${cat.title}</h2>
                    <span class="category-badge">${cat.badge}</span>
                </div>
                <div class="items-grid">
        `;

        filteredItems.forEach(item => {
            if (item.isNotice) {
                // Card Informativo Especial (ex: Lei 18 anos)
                html += `
                    <div class="notice-card">
                        <div class="notice-icon">⚠️</div>
                        <div class="notice-content">
                            <h3 class="notice-title">${item.title}</h3>
                            <p class="notice-desc">${item.description}</p>
                        </div>
                    </div>
                `;
            } else {
                const isSoldOut = item.status === 'esgotado' || state.soldOutItems.includes(item.id);
                const currentPrice = state.customPrices[item.id] !== undefined ? state.customPrices[item.id] : item.price;
                const qty = state.cart[item.id] || 0;

                html += `
                    <div class="item-card ${isSoldOut ? 'is-soldout' : ''}" id="card-${item.id}">
                        <!-- FOTO NO LADO ESQUERDO DO ITEM -->
                        ${item.image ? `
                            <div class="item-image-wrapper">
                                <img src="${encodeURI(item.image)}" alt="${item.title}" class="item-image" loading="lazy" />
                            </div>
                        ` : ''}
                        
                        <!-- DETALHES DO PRODUTO -->
                        <div class="item-details">
                            ${item.popular ? '<span class="item-badge-popular">★ Destaque</span>' : ''}
                            <h3 class="item-title">${item.title}</h3>
                            <p class="item-desc">${item.description}</p>
                            <div class="item-footer">
                                <span class="item-price">${formatCurrency(currentPrice)}</span>
                                <div class="item-actions">
                                    ${state.manageMode ? `
                                        <button class="btn-add" style="background:#dc2626; color:#fff;" onclick="toggleSoldOut('${item.id}')">
                                            ${isSoldOut ? 'Disponibilizar' : 'Esgotar'}
                                        </button>
                                    ` : (
                                        isSoldOut ? `
                                            <span style="font-size:0.78rem;font-weight:700;color:#ef4444">Esgotado</span>
                                        ` : (
                                            qty === 0 ? `
                                                <button class="btn-add" onclick="updateCartItem('${item.id}', 1)">
                                                    <span>+</span> Adicionar
                                                </button>
                                            ` : `
                                                <div class="qty-stepper">
                                                    <button class="btn-qty" onclick="updateCartItem('${item.id}', -1)">−</button>
                                                    <span class="qty-value">${qty}</span>
                                                    <button class="btn-qty" onclick="updateCartItem('${item.id}', 1)">+</button>
                                                </div>
                                            `
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        html += `
                </div>
            </section>
        `;
    });

    if (totalItemsFound === 0) {
        html = `
            <div class="empty-search">
                <p style="font-size: 2rem; margin-bottom: 8px;">🔍</p>
                <h3>Nenhum item encontrado</h3>
                <p>Tente buscar por outro termo ou categoria.</p>
            </div>
        `;
    }

    menuContent.innerHTML = html;
}

// Manipulação do Carrinho
function updateCartItem(itemId, delta) {
    const current = state.cart[itemId] || 0;
    const next = current + delta;

    if (next <= 0) {
        delete state.cart[itemId];
    } else {
        state.cart[itemId] = next;
    }

    updateCartUI();
    renderMenu();
}

function getItemById(id) {
    const categories = getActiveCategories();
    for (const cat of categories) {
        const found = cat.items.find(i => i.id === id);
        if (found) return found;
    }
    return null;
}

// Atualização de elementos da Interface do Carrinho
function updateCartUI() {
    let totalItems = 0;
    let subtotal = 0;

    Object.entries(state.cart).forEach(([id, qty]) => {
        const item = getItemById(id);
        if (item) {
            const price = state.customPrices[id] !== undefined ? state.customPrices[id] : item.price;
            totalItems += qty;
            subtotal += price * qty;
        }
    });

    const floatingBar = document.getElementById('cartFloatingBar');
    const cartCount = document.getElementById('cartBadgeCount');
    const cartValue = document.getElementById('cartTotalValue');

    if (floatingBar && cartCount && cartValue) {
        if (totalItems > 0) {
            floatingBar.classList.remove('hidden');
            cartCount.textContent = totalItems;
            cartValue.textContent = formatCurrency(subtotal);
        } else {
            floatingBar.classList.add('hidden');
        }
    }

    renderCartDrawer(totalItems, subtotal);
}

// Renderiza o Drawer do Carrinho
function renderCartDrawer(totalItems, subtotal) {
    const listEl = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryFeeEl = document.getElementById('summaryDeliveryFee');
    const totalEl = document.getElementById('summaryTotal');
    const pickupAlert = document.getElementById('pickupStoreAlert');

    if (!listEl) return;

    if (totalItems === 0) {
        listEl.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 20px 0;">Sua sacola está vazia.</p>`;
        if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatCurrency(0);
        if (totalEl) totalEl.textContent = formatCurrency(0);
        return;
    }

    let itemsHtml = '';
    Object.entries(state.cart).forEach(([id, qty]) => {
        const item = getItemById(id);
        if (!item) return;

        const price = state.customPrices[id] !== undefined ? state.customPrices[id] : item.price;
        const itemTotal = price * qty;

        itemsHtml += `
            <div class="cart-item-row">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.title}</div>
                    <div class="cart-item-price">${qty}x ${formatCurrency(price)} = ${formatCurrency(itemTotal)}</div>
                </div>
                <div class="qty-stepper">
                    <button class="btn-qty" onclick="updateCartItem('${id}', -1)">−</button>
                    <span class="qty-value">${qty}</span>
                    <button class="btn-qty" onclick="updateCartItem('${id}', 1)">+</button>
                </div>
            </div>
        `;
    });

    listEl.innerHTML = itemsHtml;

    // Cálculo da taxa de entrega
    let deliveryFee = 0;
    if (state.deliveryType === 'delivery') {
        deliveryFee = subtotal >= MENU_DATA.info.freeDeliveryAbove ? 0 : MENU_DATA.info.deliveryFee;
        if (pickupAlert) pickupAlert.style.display = 'none';
    } else {
        if (pickupAlert) {
            pickupAlert.style.display = 'flex';
            const loc = MENU_DATA.info.location;
            pickupAlert.innerHTML = `
                <span style="font-size: 1.2rem;">🏪</span>
                <div>
                    <strong>Retirada no Balcão:</strong> ${loc.street}, ${loc.number} - ${loc.neighborhood} (${loc.city})
                </div>
            `;
        }
    }

    const finalTotal = subtotal + deliveryFee;

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (deliveryFeeEl) {
        deliveryFeeEl.textContent = state.deliveryType === 'pickup' 
            ? 'Grátis (Balcão)' 
            : (deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee));
    }
    if (totalEl) totalEl.textContent = formatCurrency(finalTotal);
}

// Configuração dos Event Listeners
function setupEventListeners() {
    // Busca em tempo real
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            if (searchClear) {
                if (state.searchQuery.length > 0) {
                    searchClear.classList.add('visible');
                } else {
                    searchClear.classList.remove('visible');
                }
            }
            renderMenu();
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            state.searchQuery = '';
            searchClear.classList.remove('visible');
            renderMenu();
        });
    }

    // Modal do Carrinho
    const cartFloatingBar = document.getElementById('cartFloatingBar');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');

    if (cartFloatingBar && cartModal) {
        cartFloatingBar.addEventListener('click', () => {
            cartModal.classList.add('active');
        });
    }

    if (closeCartBtn && cartModal) {
        closeCartBtn.addEventListener('click', () => {
            cartModal.classList.remove('active');
        });
    }

    // Modal de Informações / Horários
    const storeHeaderPill = document.getElementById('statusBadge');
    const hoursPill = document.getElementById('hoursPill');
    const infoModal = document.getElementById('infoModal');
    const closeInfoBtn = document.getElementById('closeInfoBtn');

    [storeHeaderPill, hoursPill].forEach(btn => {
        if (btn && infoModal) {
            btn.addEventListener('click', () => {
                infoModal.classList.add('active');
            });
        }
    });

    if (closeInfoBtn && infoModal) {
        closeInfoBtn.addEventListener('click', () => {
            infoModal.classList.remove('active');
        });
    }

    // Fechar ao clicar fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Tipo de entrega (Delivery vs Retirada)
    const btnDelivery = document.getElementById('btnDelivery');
    const btnPickup = document.getElementById('btnPickup');
    const deliveryFields = document.getElementById('deliveryFields');

    if (btnDelivery && btnPickup) {
        btnDelivery.addEventListener('click', () => {
            state.deliveryType = 'delivery';
            btnDelivery.classList.add('active');
            btnPickup.classList.remove('active');
            if (deliveryFields) deliveryFields.style.display = 'block';
            updateCartUI();
        });

        btnPickup.addEventListener('click', () => {
            state.deliveryType = 'pickup';
            btnPickup.classList.add('active');
            btnDelivery.classList.remove('active');
            if (deliveryFields) deliveryFields.style.display = 'none';
            updateCartUI();
        });
    }

    // Métodos de Pagamento
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.paymentMethod = btn.dataset.method;

            const changeBox = document.getElementById('changeBox');
            if (changeBox) {
                changeBox.style.display = state.paymentMethod === 'money' ? 'block' : 'none';
            }
        });
    });

    // Envio do Pedido no WhatsApp
    const btnSendWhatsApp = document.getElementById('btnSendWhatsApp');
    if (btnSendWhatsApp) {
        btnSendWhatsApp.addEventListener('click', sendOrderViaWhatsApp);
    }

    // Rolagem horizontal e indicadores das abas de categorias
    const tabsScroll = document.getElementById('tabsScroll');
    const arrowLeft = document.getElementById('tabsScrollLeft');
    const arrowRight = document.getElementById('tabsScrollRight');
    const fadeLeft = document.getElementById('tabsFadeLeft');
    const fadeRight = document.getElementById('tabsFadeRight');

    function updateTabsFadeIndicators() {
        if (!tabsScroll) return;
        const current = tabsScroll.scrollLeft;
        const max = tabsScroll.scrollWidth - tabsScroll.clientWidth;

        if (current > 10) {
            if (fadeLeft) fadeLeft.style.opacity = '1';
            if (arrowLeft) {
                arrowLeft.style.opacity = '1';
                arrowLeft.style.pointerEvents = 'auto';
            }
        } else {
            if (fadeLeft) fadeLeft.style.opacity = '0';
            if (arrowLeft) {
                arrowLeft.style.opacity = '0';
                arrowLeft.style.pointerEvents = 'none';
            }
        }

        if (max <= 5 || current >= max - 10) {
            if (fadeRight) fadeRight.style.opacity = '0';
            if (arrowRight) {
                arrowRight.style.opacity = '0';
                arrowRight.style.pointerEvents = 'none';
            }
        } else {
            if (fadeRight) fadeRight.style.opacity = '1';
            if (arrowRight) {
                arrowRight.style.opacity = '1';
                arrowRight.style.pointerEvents = 'auto';
            }
        }
    }

    if (tabsScroll) {
        tabsScroll.addEventListener('scroll', updateTabsFadeIndicators, { passive: true });
        window.addEventListener('resize', updateTabsFadeIndicators);
        // Atualiza logo após renderizar
        setTimeout(updateTabsFadeIndicators, 200);
        setTimeout(updateTabsFadeIndicators, 800);
    }

    if (arrowRight && tabsScroll) {
        arrowRight.addEventListener('click', () => {
            tabsScroll.scrollBy({ left: 160, behavior: 'smooth' });
        });
    }

    if (arrowLeft && tabsScroll) {
        arrowLeft.addEventListener('click', () => {
            tabsScroll.scrollBy({ left: -160, behavior: 'smooth' });
        });
    }

    // Scrollspy para abas ativas
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
}

// Scrollspy para atualizar a aba ativa durante rolagem
function handleScrollSpy() {
    const sections = document.querySelectorAll('.category-section');
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.id.replace('category-', '');

        if (scrollPos >= top && scrollPos < top + height) {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                const isActive = btn.dataset.cat === id;
                if (isActive && !btn.classList.contains('active')) {
                    btn.classList.add('active');
                    btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                } else if (!isActive) {
                    btn.classList.remove('active');
                }
            });
        }
    });
}

// Construção e envio do pedido pelo WhatsApp
function sendOrderViaWhatsApp() {
    const cartEntries = Object.entries(state.cart);
    if (cartEntries.length === 0) {
        alert('Sua sacola está vazia!');
        return;
    }

    const customerName = document.getElementById('custName')?.value.trim();
    if (!customerName) {
        alert('Por favor, informe seu nome para o pedido.');
        document.getElementById('custName')?.focus();
        return;
    }

    const loc = MENU_DATA.info.location;
    let addressStr = '';
    if (state.deliveryType === 'delivery') {
        const street = document.getElementById('custStreet')?.value.trim();
        const number = document.getElementById('custNumber')?.value.trim();
        const neighborhood = document.getElementById('custNeighborhood')?.value.trim();
        const complement = document.getElementById('custComplement')?.value.trim();

        if (!street || !number || !neighborhood) {
            alert('Por favor, preencha o endereço completo para a entrega.');
            return;
        }

        addressStr = `📍 *Endereço de Entrega:*\n${street}, Nº ${number}\nBairro: ${neighborhood}${complement ? ` (${complement})` : ''}\n`;
    } else {
        addressStr = `🛍️ *Retirada no Balcão*\nLocal: ${loc.street}, ${loc.number} - ${loc.neighborhood}\n`;
    }

    let subtotal = 0;
    let itemsText = '';

    cartEntries.forEach(([id, qty]) => {
        const item = getItemById(id);
        if (item) {
            const price = state.customPrices[id] !== undefined ? state.customPrices[id] : item.price;
            const itemTotal = price * qty;
            subtotal += itemTotal;
            itemsText += `• ${qty}x ${item.title} (${formatCurrency(itemTotal)})\n`;
        }
    });

    let deliveryFee = 0;
    if (state.deliveryType === 'delivery') {
        deliveryFee = subtotal >= MENU_DATA.info.freeDeliveryAbove ? 0 : MENU_DATA.info.deliveryFee;
    }
    const finalTotal = subtotal + deliveryFee;

    const paymentLabels = {
        pix: 'Pix',
        card: 'Cartão na Entrega / Retirada',
        money: 'Dinheiro'
    };
    let paymentText = `💳 *Forma de Pagamento:* ${paymentLabels[state.paymentMethod]}`;
    if (state.paymentMethod === 'money') {
        const change = document.getElementById('custChange')?.value.trim();
        paymentText += change ? ` (Troco para R$ ${change})` : ' (Não precisa de troco)';
    }

    const notes = document.getElementById('custNotes')?.value.trim();
    const notesText = notes ? `\n📝 *Observações:* ${notes}\n` : '';

    const message = 
`🍺 *NOVO PEDIDO - ${MENU_DATA.info.name}*
────────────────────────
👤 *Cliente:* ${customerName}
${addressStr}
📦 *Itens do Pedido:*
${itemsText}
────────────────────────
Subtotal: ${formatCurrency(subtotal)}
Taxa de Entrega: ${deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}
*Total: ${formatCurrency(finalTotal)}*
────────────────────────
${paymentText}${notesText}
Confirmo o pedido para preparo e envio!`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${MENU_DATA.info.whatsapp}?text=${encodedMsg}`;

    window.open(whatsappUrl, '_blank');
}

// Modo Gerenciador / Gestão rápida de itens
function toggleSoldOut(itemId) {
    const idx = state.soldOutItems.indexOf(itemId);
    if (idx >= 0) {
        state.soldOutItems.splice(idx, 1);
    } else {
        state.soldOutItems.push(itemId);
    }
    localStorage.setItem('adega_sold_out', JSON.stringify(state.soldOutItems));
    renderMenu();
}

function toggleManageMode() {
    state.manageMode = !state.manageMode;
    const btn = document.getElementById('toggleManageModeBtn');
    if (btn) {
        btn.textContent = state.manageMode ? '✓ Sair do Modo Gestão' : '⚙️ Modo Gestão (Esgotar/Preços)';
    }
    renderMenu();
}
