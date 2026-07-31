/* ============================================================
   CONFIG DA LOJA — edite aqui as informações principais.
   ============================================================ */
window.CONFIG = {
  // --- Identidade ---
  loja: "Cloud Pods",
  slogan: "O despacho mais rápido de Maceió",
  cidade: "Maceió · AL",
  logo: "assets/img/logo.jpg",

  // --- Contato (só números, com DDI 55 + DDD) ---
  // Obs.: se o botão não abrir a conversa certa, confira se falta o 9º dígito.
  whatsapp: "558299530046",

  // --- Redes sociais (só o @, sem a URL) ---
  instagram: "cloudpodsbrasil",

  // --- Cor de acento do site (muda CTAs, brilhos e destaques) ---
  acentoCor:   "#2dd4bf",  // teal
  acentoCor2:  "#22d3ee",  // cyan

  // --- Contador "estoque atualizado" (ISO: ano-mês-diaThora) ---
  countdownAte: "2026-08-31T18:00:00",
  countdownTitulo: "Estoque atualiza em",

  // --- Entrega ---
  horariosFreteGratis: ["13h", "15h", "17h", "18h"],

  // --- Bairros (usados no select do checkout e na tabela de frete) ---
  // valor = frete EXPRESSO (opcional/mais rápido) · tempo = estimativa em minutos
  freteExpresso: [
    { bairro: "Jatiúca",        valor: 12, tempo: "20-30 min" },
    { bairro: "Ponta Verde",    valor: 12, tempo: "20-30 min" },
    { bairro: "Pajuçara",       valor: 14, tempo: "25-35 min" },
    { bairro: "Poço",           valor: 15, tempo: "25-40 min" },
    { bairro: "Farol",          valor: 16, tempo: "30-45 min" },
    { bairro: "Cruz das Almas", valor: 16, tempo: "30-45 min" },
    { bairro: "Outras regiões", valor: 18, tempo: "consultar" },
  ],

  // --- Formas de pagamento oferecidas ---
  pagamentos: ["PIX", "Dinheiro", "Cartão (maquininha)"],
};
