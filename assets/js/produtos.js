/* ============================================================
   PRODUTOS — fonte única da vitrine.
   Para ADICIONAR um produto: copie um bloco { ... } e edite.
   Para REMOVER / esgotar: apague o bloco OU deixe  ativo: false
   ------------------------------------------------------------
   Campos:
     id        (texto único, sem espaço)         — obrigatório
     nome                                          — obrigatório
     descricao                                     — obrigatório
     imagem    (caminho em assets/img/)            — obrigatório
     preco     (número)                            — obrigatório
     precoDe   (número, opcional = preço riscado)
     badge     (texto curto, opcional = etiqueta)
     destaque  (true/false, opcional = card realçado)
     sabores   (lista de textos)                   — opcional
     ativo     (true/false; false = some do site)
   ============================================================ */
window.PRODUTOS = [
  {
    id: "ignite-v250",
    nome: "Ignite V250 — 25.000 Puffs",
    descricao: "Pod descartável de alta duração, até 25.000 puffs, com desempenho estável e sabor consistente do começo ao fim.",
    imagem: "assets/img/ignite-v250.jpg",
    precoDe: 109.99,
    preco: 99.99,
    badge: "",
    destaque: false,
    sabores: ["Icy Mint", "Grape Ice", "Strawberry Ice", "Watermelon Ice", "Strawberry Banana"],
    ativo: true,
  },
  {
    id: "elfbar-bc15k",
    nome: "Elfbar BC15K — 15.000 Puffs",
    descricao: "15 mil puffs de alta duração, com sabores frutados, gelados (ice), mentolados e misturas premium.",
    imagem: "assets/img/elfbar-bc15k.png",
    precoDe: 89.99,
    preco: 69.99,
    badge: "",
    destaque: false,
    sabores: ["Ice Mint", "Sakura Grape", "Watermelon Ice", "Strawberry Watermelon", "Peach Mango Watermelon"],
    ativo: true,
  },
  {
    id: "elfbar-king-40k",
    nome: "Elfbar King — 40.000 Puffs",
    descricao: "40 mil puffs com seletor de potência (Turbo 1, 2 e 3). Alta duração, sabores frutados, gelados, mentolados e misturas premium.",
    imagem: "assets/img/elfbar-king-40k.webp",
    precoDe: 599.80,
    preco: 269.90,
    badge: "MAIS VENDIDO",
    destaque: true,
    sabores: ["Frutados", "Gelados (Ice)", "Mentolados", "Premium", "Me surpreenda"],
    ativo: true,
  },
  {
    id: "ignite-v400",
    nome: "Ignite V400 Mix — 40.000 Puffs",
    descricao: "Pod descartável Dual-Flavor: dois sabores em um só dispositivo, com até 40.000 puffs.",
    imagem: "assets/img/ignite-v400.png",
    precoDe: 599.80,
    preco: 269.90,
    badge: "NOVO",
    destaque: false,
    sabores: ["Grape · Peach", "Frutados", "Gelados (Ice)", "Premium", "Me surpreenda"],
    ativo: true,
  },
];
