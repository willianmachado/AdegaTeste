/**
 * Cardápio Digital - Dados Oficiais
 * Adega do Bairro
 */

const MENU_DATA = {
    info: {
        name: "Adega do Bairro",
        tagline: "Bebidas geladas, combos e destilados com entrega rápida",
        initial: "A",
        whatsapp: "5511999999999", // Número configurável para receber os pedidos
        deliveryFee: 5.00,
        freeDeliveryAbove: 80.00,
        
        // 1. Configuração completa de Localização da Loja
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
            deliveryRadius: "Entregamos num raio de até 8 km em até 40 min",
            pickupAvailable: true
        },

        hours: [
            { days: "Segunda a Quinta", start: "16:00", end: "00:00", note: "16h às 0h" },
            { days: "Sexta e Sábado", start: "16:00", end: "02:00", note: "16h às 2h" },
            { days: "Domingo", start: "14:00", end: "22:00", note: "14h às 22h" }
        ],
        legalNotice: "Bebida alcoólica só para maiores de 18 anos (Lei 13.106/2015). Podemos pedir documento com foto na entrega."
    },
    categories: [
        {
            id: "importante",
            title: "Importante",
            badge: "Aviso Legal",
            items: [
                {
                    id: "aviso-18",
                    title: "Proibida a venda para menores de 18 anos",
                    description: "Bebida alcoólica só para maiores de 18 anos (Lei 13.106/2015). Podemos pedir documento com foto na entrega.",
                    price: 0.00,
                    isNotice: true,
                    image: null
                }
            ]
        },
        {
            id: "cervejas",
            title: "Cervejas",
            badge: "Geladas",
            items: [
                {
                    id: "cerveja-lata-350",
                    title: "Cerveja lata 350 ml",
                    description: "Pilsen, bem gelada.",
                    price: 5.00,
                    image: "assets/images/beer.png",
                    popular: true
                },
                {
                    id: "cerveja-long-neck",
                    title: "Cerveja long neck",
                    description: "330 ml. Pergunte as marcas do dia.",
                    price: 8.00,
                    image: null
                },
                {
                    id: "cerveja-600ml",
                    title: "Cerveja 600 ml",
                    description: "Garrafa retornável. Traga o casco.",
                    price: 12.00,
                    image: null
                },
                {
                    id: "fardo-12-latas",
                    title: "Fardo com 12 latas",
                    description: "12 latas de 350 ml, gelado.",
                    price: 55.00,
                    image: "assets/images/Fardo com 12 latas.jpg",
                    popular: true
                }
            ]
        },
        {
            id: "combos",
            title: "Combos",
            badge: "Mais Vendidos",
            items: [
                {
                    id: "combo-vodca",
                    title: "Combo vodca",
                    description: "1 vodca de 1 litro + 4 energéticos de 2 litros + 1 saco de gelo.",
                    price: 95.00,
                    image: "assets/images/combo-vodca.png",
                    popular: true
                },
                {
                    id: "combo-gin",
                    title: "Combo gin tônica",
                    description: "1 gin de 750 ml + 6 águas tônicas + 1 saco de gelo.",
                    price: 110.00,
                    image: "assets/images/combo-gin.png",
                    popular: true
                },
                {
                    id: "combo-whisky",
                    title: "Combo whisky",
                    description: "1 whisky 8 anos de 1 litro + 2 energéticos de 2 litros + 1 saco de gelo.",
                    price: 160.00,
                    image: "assets/images/combo-whisky.png",
                    popular: true
                }
            ]
        },
        {
            id: "destilados",
            title: "Destilados",
            badge: "Garrafas Fechadas",
            items: [
                {
                    id: "vodca-1l",
                    title: "Vodca 1 litro",
                    description: "Garrafa fechada.",
                    price: 45.00,
                    image: null
                },
                {
                    id: "gin-750ml",
                    title: "Gin 750 ml",
                    description: "Garrafa fechada.",
                    price: 70.00,
                    image: null
                },
                {
                    id: "whisky-8anos",
                    title: "Whisky 8 anos 1 litro",
                    description: "Garrafa fechada.",
                    price: 120.00,
                    image: null
                },
                {
                    id: "cachaca-1l",
                    title: "Cachaça 1 litro",
                    description: "Prata ou ouro.",
                    price: 25.00,
                    image: null
                }
            ]
        },
        {
            id: "vinhos",
            title: "Vinhos",
            badge: "Selecionados",
            items: [
                {
                    id: "vinho-tinto-750",
                    title: "Vinho tinto seco 750 ml",
                    description: "Pergunte as opções da semana.",
                    price: 45.00,
                    image: "assets/images/vinho-tinto.png",
                    popular: true
                },
                {
                    id: "vinho-branco-750",
                    title: "Vinho branco seco 750 ml",
                    description: "Pergunte as opções da semana.",
                    price: 45.00,
                    image: "assets/images/Vinho branco seco 750 ml.png"
                },
                {
                    id: "espumante-750",
                    title: "Espumante 750 ml",
                    description: "Brut ou moscatel.",
                    price: 55.00,
                    image: null
                }
            ]
        },
        {
            id: "sem-alcool",
            title: "Sem álcool e gelo",
            badge: "Bebidas & Gelo",
            items: [
                {
                    id: "energetico-2l",
                    title: "Energético 2 litros",
                    description: "Pergunte os sabores.",
                    price: 18.00,
                    image: null
                },
                {
                    id: "refrigerante-2l",
                    title: "Refrigerante 2 litros",
                    description: "Pergunte os sabores.",
                    price: 13.00,
                    image: "assets/images/Refrigerante 2 litros.png",
                    popular: true
                },
                {
                    id: "agua-tonica-lata",
                    title: "Água tônica lata",
                    description: "350 ml.",
                    price: 5.00,
                    image: "assets/images/Água tônica lata.png"
                },
                {
                    id: "gelo-5kg",
                    title: "Gelo 5 kg",
                    description: "Saco de gelo em cubos.",
                    price: 15.00,
                    image: "assets/images/gelo.png",
                    popular: true
                },
                {
                    id: "gelo-coco",
                    title: "Gelo de coco",
                    description: "Unidade, vários sabores.",
                    price: 3.00,
                    image: "assets/images/Gelo de coco.png"
                }
            ]
        }
    ]
};
