# 🍷 Cardápio Digital - Adega do Bairro

> 📄 **Guia completo para continuidade do projeto em novos chats:** Veja o arquivo [CONTEXTO_PROJETO.md](file:///mnt/500gbProM2/Antigravity/Projetos/teste1/CONTEXTO_PROJETO.md).

Cardápio digital mobile-first, com **Tema Dark padrão**, acentos em **Amarelo Dourado**, fotos no lado esquerdo de cada item e seção de **Localização da Adega**.

---

## 📋 Resumo das Categorias e Fotos Vinculadas

| Categoria | Itens Cadastrados | Preço | Foto no Lado Esquerdo |
| :--- | :--- | :--- | :---: |
| **Aviso Legal** | Proibida a venda de bebidas para menores de 18 anos (Lei 13.106/2015) | Informativo | — |
| **Cervejas** | Cerveja lata 350 ml (Pilsen, bem gelada) | R$ 5,00 | `beer.png` |
| | Cerveja long neck 330 ml | R$ 8,00 | — |
| | Cerveja 600 ml (Garrafa retornável) | R$ 12,00 | — |
| | Fardo com 12 latas (350 ml) | R$ 55,00 | `Fardo com 12 latas.jpg` |
| **Combos** | Combo vodca (1L vodca + 4 energéticos 2L + gelo) | R$ 95,00 | `combo-vodca.png` |
| | Combo gin tônica (750ml gin + 6 tônicas + gelo) | R$ 110,00 | `combo-gin.png` |
| | Combo whisky (1L whisky 8 anos + 2 energéticos 2L + gelo) | R$ 160,00 | `combo-whisky.png` |
| **Destilados** | Vodca 1 litro (Garrafa fechada) | R$ 45,00 | — |
| | Gin 750 ml (Garrafa fechada) | R$ 70,00 | — |
| | Whisky 8 anos 1 litro (Garrafa fechada) | R$ 120,00 | — |
| | Cachaça 1 litro (Prata ou ouro) | R$ 25,00 | — |
| **Vinhos** | Vinho tinto seco 750 ml | R$ 45,00 | `vinho-tinto.png` |
| | Vinho branco seco 750 ml | R$ 45,00 | `Vinho branco seco 750 ml.png` |
| | Espumante 750 ml (Brut ou moscatel) | R$ 55,00 | — |
| **Sem álcool e gelo** | Energético 2 litros | R$ 18,00 | — |
| | Refrigerante 2 litros | R$ 13,00 | `Refrigerante 2 litros.png` |
| | Água tônica lata 350 ml | R$ 5,00 | `Água tônica lata.png` |
| | Gelo 5 kg (Saco em cubos) | R$ 15,00 | `gelo.png` |
| | Gelo de coco (Unidade) | R$ 3,00 | `Gelo de coco.png` |

---

## 📍 Localização da Loja

O endereço e as configurações de entrega estão disponíveis no card da página e no arquivo `js/data.js`:

```javascript
location: {
    street: "Rua das Bebidas",
    number: "123",
    neighborhood: "Bairro Alto",
    city: "São Paulo",
    state: "SP",
    cep: "01234-567",
    reference: "Próximo à Praça Central • Em frente ao Posto Ipiranga",
    fullAddress: "Rua das Bebidas, 123 - Bairro Alto, São Paulo - SP",
    googleMapsUrl: "https://maps.google.com/?q=Rua+das+Bebidas,+123+-+Bairro+Alto,+São+Paulo+-+SP",
    deliveryRadius: "Entregamos num raio de até 8 km em até 40 min"
}
```

- **Pill no Topo:** `📍 Onde Estamos` desliza suavemente até o card de localização.
- **Card na Página:** Contém botão direto para o **Google Maps** e botão para **Copiar Endereço**.
- **Checkout Inteligente:** Ao selecionar "Retirar no Balcão", exibe o endereço completo para o cliente retirar seu pedido.

---

## 🚀 Como Executar

Abra o arquivo `index.html` diretamente em seu navegador ou suba um servidor estático:

```bash
python3 -m http.server 8080
```
Acesse: `http://localhost:8080`
