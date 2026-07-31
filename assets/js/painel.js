/* ============================================================
   PAINEL — editor local do site Cloud Pods.
   Carrega os dados atuais, você edita e BAIXA os arquivos .js
   prontos para subir em assets/js/ na Hostinger.
   (Site estático: o painel não grava no servidor — ele gera os arquivos.)
   ============================================================ */
(function () {
  "use strict";

  /* >>> TROQUE A SENHA AQUI <<< (proteção leve; veja dicas no rodapé do painel) */
  var SENHA = "cloudpods2026";

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(t, cls, html) { var e = document.createElement(t); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function clone(x) { return x ? JSON.parse(JSON.stringify(x)) : x; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* estado editável — usa o que foi salvo (localStorage) ou os arquivos atuais */
  var _saved = null;
  try { _saved = JSON.parse(localStorage.getItem("cp_data")); } catch (e) {}
  var state = {
    produtos: clone((_saved && _saved.produtos) || window.PRODUTOS) || [],
    reviews:  clone((_saved && _saved.reviews) || window.DEPOIMENTOS) || [],
    faq:      clone((_saved && _saved.faq) || window.FAQ) || [],
    config:   clone((_saved && _saved.config) || window.CONFIG) || {},
  };
  var dirty = false;

  /* ---------------- senha ---------------- */
  function gate() {
    if (sessionStorage.getItem("painel_ok") === "1") { start(); return; }
    var g = $("#gate");
    g.style.display = "grid";
    $("#gateBtn").addEventListener("click", tryLogin);
    $("#gatePass").addEventListener("keydown", function (e) { if (e.key === "Enter") tryLogin(); });
    function tryLogin() {
      if ($("#gatePass").value === SENHA) {
        sessionStorage.setItem("painel_ok", "1");
        g.style.display = "none"; start();
      } else {
        $("#gateErr").style.display = "block";
      }
    }
  }

  /* ---------------- tabs ---------------- */
  function start() {
    $("#app").style.display = "block";
    $("#exportbar").style.display = "flex";
    $all(".tab").forEach(function (t) {
      t.addEventListener("click", function () {
        $all(".tab").forEach(function (x) { x.classList.remove("on"); });
        $all(".panel").forEach(function (x) { x.classList.remove("on"); });
        t.classList.add("on");
        $("#panel-" + t.dataset.tab).classList.add("on");
      });
    });
    renderProdutos();
    renderReviews();
    renderFaq();
    renderBairros();
    renderConfig();
    wireExports();
    setStatus();
    $("#save").addEventListener("click", save);
    $("#restore").addEventListener("click", restore);
    $("#verSite").addEventListener("click", function () {
      if (dirty) save();
      window.open("index.html", "_blank");
    });
    $("#logout").addEventListener("click", function () { sessionStorage.removeItem("painel_ok"); location.reload(); });
    window.addEventListener("beforeunload", function (e) {
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    });
  }

  /* ============================================================
     PRODUTOS
     ============================================================ */
  function renderProdutos() {
    var box = $("#prodList"); box.innerHTML = "";
    state.produtos.forEach(function (p, i) {
      var card = el("div", "item");
      card.innerHTML =
        '<div class="item-head">' +
          '<b>' + (esc(p.nome) || "(sem nome)") + '</b>' +
          '<div class="item-actions">' +
            '<button class="mini" data-act="up" data-i="' + i + '" title="Subir">↑</button>' +
            '<button class="mini" data-act="down" data-i="' + i + '" title="Descer">↓</button>' +
            '<button class="mini danger" data-act="del" data-i="' + i + '" title="Remover">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="grid2">' +
          field("Nome", 'text', 'nome', i, p.nome) +
          field("Imagem (caminho)", 'text', 'imagem', i, p.imagem, "assets/img/arquivo.png") +
        '</div>' +
        '<div class="media-row">' +
          '<img class="thumb" src="' + esc(p.imagem || "") + '" alt="" onerror="this.style.opacity=.15">' +
          '<label class="upload">Escolher imagem do PC (embute no arquivo)' +
            '<input type="file" accept="image/*" data-embed="' + i + '">' +
          '</label>' +
        '</div>' +
        '<div class="grid3">' +
          field("Preço (R$)", 'number', 'preco', i, p.preco) +
          field("Preço antigo (opcional)", 'number', 'precoDe', i, p.precoDe) +
          field("Etiqueta (badge)", 'text', 'badge', i, p.badge, "Ex.: NOVO") +
        '</div>' +
        area("Descrição", 'descricao', i, p.descricao) +
        field("Sabores (separe por vírgula)", 'text', '_sabores', i, (p.sabores || []).join(", ")) +
        '<div class="checks">' +
          check("Em destaque (card realçado)", 'destaque', i, p.destaque) +
          check("Ativo (aparece no site)", 'ativo', i, p.ativo !== false) +
        '</div>';
      box.appendChild(card);
    });
    box.oninput = function (e) { bindList(e, state.produtos, renderNothing); };
    box.onchange = function (e) {
      var emb = e.target.getAttribute("data-embed");
      if (emb != null) return embedImg(e.target, state.produtos[+emb], "imagem", renderProdutos);
      bindList(e, state.produtos, null);
    };
    box.onclick = function (e) { listActions(e, state.produtos, renderProdutos); };
  }
  function renderNothing() {}

  /* ============================================================
     AVALIAÇÕES
     ============================================================ */
  function renderReviews() {
    var box = $("#revList"); box.innerHTML = "";
    state.reviews.forEach(function (r, i) {
      var card = el("div", "item");
      card.innerHTML =
        '<div class="item-head"><b>' + (esc(r.nome) || "(sem nome)") + '</b>' +
          '<div class="item-actions">' +
            '<button class="mini" data-act="up" data-i="' + i + '">↑</button>' +
            '<button class="mini" data-act="down" data-i="' + i + '">↓</button>' +
            '<button class="mini danger" data-act="del" data-i="' + i + '">✕</button>' +
          '</div></div>' +
        '<div class="grid3">' +
          field("Nome", 'text', 'nome', i, r.nome) +
          field("Bairro/local", 'text', 'local', i, r.local) +
          selectNota(i, r.nota) +
        '</div>' +
        area("Comentário", 'texto', i, r.texto) +
        field("Foto (opcional, caminho)", 'text', 'foto', i, r.foto, "assets/img/cliente.jpg");
      box.appendChild(card);
    });
    box.oninput = function (e) { bindList(e, state.reviews, null); };
    box.onchange = function (e) { bindList(e, state.reviews, null); };
    box.onclick = function (e) { listActions(e, state.reviews, renderReviews); };
  }
  function selectNota(i, val) {
    var v = val || 5, opts = "";
    for (var n = 5; n >= 1; n--) opts += '<option value="' + n + '"' + (n === v ? " selected" : "") + '>' + "★".repeat(n) + "</option>";
    return '<div class="fld"><label>Nota</label><select data-f="nota" data-i="' + i + '">' + opts + '</select></div>';
  }

  /* ============================================================
     FAQ
     ============================================================ */
  function renderFaq() {
    var box = $("#faqList"); box.innerHTML = "";
    state.faq.forEach(function (f, i) {
      var card = el("div", "item");
      card.innerHTML =
        '<div class="item-head"><b>' + (esc(f.q) || "(pergunta)") + '</b>' +
          '<div class="item-actions">' +
            '<button class="mini" data-act="up" data-i="' + i + '">↑</button>' +
            '<button class="mini" data-act="down" data-i="' + i + '">↓</button>' +
            '<button class="mini danger" data-act="del" data-i="' + i + '">✕</button>' +
          '</div></div>' +
        field("Pergunta", 'text', 'q', i, f.q) +
        area("Resposta", 'a', i, f.a);
      box.appendChild(card);
    });
    box.oninput = function (e) { bindList(e, state.faq, null); };
    box.onclick = function (e) { listActions(e, state.faq, renderFaq); };
  }

  /* ============================================================
     CONFIG
     ============================================================ */
  function renderConfig() {
    var c = state.config;
    var box = $("#cfgBox");
    box.innerHTML =
      '<div class="grid2">' +
        cfield("Nome da loja", "loja", c.loja) +
        cfield("Slogan", "slogan", c.slogan) +
        cfield("Cidade", "cidade", c.cidade) +
        cfield("Logo (caminho)", "logo", c.logo) +
        cfield("WhatsApp (só números, 55+DDD)", "whatsapp", c.whatsapp) +
        cfield("Instagram (só o @)", "instagram", c.instagram) +
        cfield("Cor de acento", "acentoCor", c.acentoCor, "color") +
        cfield("Cor de acento 2", "acentoCor2", c.acentoCor2, "color") +
        cfield("Contador até (AAAA-MM-DDThh:mm:ss)", "countdownAte", c.countdownAte) +
        cfield("Título do contador", "countdownTitulo", c.countdownTitulo) +
      '</div>' +
      '<div class="fld"><label>Horários de frete grátis (separe por vírgula)</label>' +
        '<input type="text" id="cfg_horarios" value="' + esc((c.horariosFreteGratis || []).join(", ")) + '"></div>' +
      '<div class="fld"><label>Formas de pagamento (separe por vírgula)</label>' +
        '<input type="text" id="cfg_pag" value="' + esc((c.pagamentos || []).join(", ")) + '"></div>';

    box.oninput = function (e) {
      var f = e.target.getAttribute("data-cfg");
      if (f) c[f] = e.target.value;
      if (e.target.id === "cfg_horarios") c.horariosFreteGratis = splitCsv(e.target.value);
      if (e.target.id === "cfg_pag") c.pagamentos = splitCsv(e.target.value);
      markDirty();
    };
  }

  /* ============================================================
     BAIRROS (aba dedicada) — aparecem no checkout
     ============================================================ */
  function renderBairros() {
    var c = state.config;
    renderFrete();
    $("#addFrete").addEventListener("click", function () {
      (c.freteExpresso = c.freteExpresso || []).push({ bairro: "", valor: 0, tempo: "" });
      renderFrete();
    });
  }
  function renderFrete() {
    var c = state.config, box = $("#freteList"); box.innerHTML = "";
    (c.freteExpresso || []).forEach(function (f, i) {
      var row = el("div", "frete-row");
      row.innerHTML =
        '<input type="text" placeholder="Bairro" value="' + esc(f.bairro) + '" data-fr="bairro" data-i="' + i + '">' +
        '<input type="number" placeholder="Valor" value="' + esc(f.valor) + '" data-fr="valor" data-i="' + i + '">' +
        '<input type="text" placeholder="Tempo" value="' + esc(f.tempo) + '" data-fr="tempo" data-i="' + i + '">' +
        '<button class="mini danger" data-fr-del="' + i + '">✕</button>';
      box.appendChild(row);
    });
    box.oninput = function (e) {
      var f = e.target.getAttribute("data-fr"); if (!f) return;
      var i = +e.target.getAttribute("data-i");
      c.freteExpresso[i][f] = f === "valor" ? num(e.target.value) : e.target.value;
      markDirty();
    };
    box.onclick = function (e) {
      var d = e.target.getAttribute("data-fr-del");
      if (d != null) { c.freteExpresso.splice(+d, 1); renderFrete(); markDirty(); }
    };
  }

  /* ---------------- inputs helpers ---------------- */
  function field(label, type, f, i, val, ph) {
    return '<div class="fld"><label>' + label + '</label>' +
      '<input type="' + type + '" data-f="' + f + '" data-i="' + i + '" value="' + esc(val) + '"' +
      (ph ? ' placeholder="' + esc(ph) + '"' : "") + (type === "number" ? ' step="0.01"' : "") + '></div>';
  }
  function area(label, f, i, val) {
    return '<div class="fld"><label>' + label + '</label>' +
      '<textarea data-f="' + f + '" data-i="' + i + '">' + esc(val) + '</textarea></div>';
  }
  function check(label, f, i, on) {
    return '<label class="chk"><input type="checkbox" data-f="' + f + '" data-i="' + i + '"' + (on ? " checked" : "") + '> ' + label + '</label>';
  }
  function cfield(label, f, val, type) {
    return '<div class="fld"><label>' + label + '</label>' +
      '<input type="' + (type || "text") + '" data-cfg="' + f + '" value="' + esc(val) + '"></div>';
  }
  function splitCsv(s) { return String(s).split(",").map(function (x) { return x.trim(); }).filter(Boolean); }
  function num(v) { var n = parseFloat(String(v).replace(",", ".")); return isNaN(n) ? 0 : n; }

  function bindList(e, arr, after) {
    var f = e.target.getAttribute("data-f"); if (f == null) return;
    var i = +e.target.getAttribute("data-i"); var o = arr[i]; if (!o) return;
    if (e.target.type === "checkbox") o[f] = e.target.checked;
    else if (f === "_sabores") o.sabores = splitCsv(e.target.value);
    else if (f === "nota") o.nota = +e.target.value;
    else if (e.target.type === "number") o[f] = e.target.value === "" ? undefined : num(e.target.value);
    else o[f] = e.target.value;
    liveHead(e.target, o);
    markDirty();
    if (after) after();
  }
  /* atualiza título e miniatura do item em tempo real, sem re-render */
  function liveHead(input, o) {
    var item = input.closest && input.closest(".item"); if (!item) return;
    var b = item.querySelector(".item-head b");
    if (b) b.textContent = o.nome || o.q || "(sem nome)";
    if (input.getAttribute("data-f") === "imagem") {
      var img = item.querySelector(".thumb");
      if (img) { img.src = o.imagem || ""; img.style.opacity = ""; }
    }
  }
  function listActions(e, arr, rerender) {
    var act = e.target.getAttribute("data-act"); if (!act) return;
    var i = +e.target.getAttribute("data-i");
    if (act === "del") { if (confirm("Remover este item?")) arr.splice(i, 1); }
    if (act === "up" && i > 0) { var a = arr.splice(i, 1)[0]; arr.splice(i - 1, 0, a); }
    if (act === "down" && i < arr.length - 1) { var b = arr.splice(i, 1)[0]; arr.splice(i + 1, 0, b); }
    rerender(); markDirty();
  }
  function embedImg(input, obj, field, after) {
    var file = input.files && input.files[0]; if (!file) return;
    if (file.size > 600 * 1024 && !confirm("Imagem grande (" + Math.round(file.size / 1024) + " KB). Embutir mesmo assim? (deixa o site mais pesado)")) return;
    var reader = new FileReader();
    reader.onload = function () { obj[field] = reader.result; markDirty(); after(); };
    reader.readAsDataURL(file);
  }

  /* ---------------- salvar / status ---------------- */
  function markDirty() { dirty = true; setStatus(); }
  function setStatus() {
    var s = $("#saveStatus"); if (!s) return;
    s.textContent = dirty ? "● Alterações não salvas" : "✓ Salvo neste navegador";
    s.className = "save-status" + (dirty ? " dirty" : "");
  }
  function save() {
    try {
      localStorage.setItem("cp_data", JSON.stringify({
        produtos: state.produtos, reviews: state.reviews, faq: state.faq, config: state.config,
      }));
      dirty = false; setStatus();
      toast("Salvo! O site já mostra as mudanças neste aparelho. Para todos verem, use “Baixar p/ publicar”.");
    } catch (e) { toast("Não consegui salvar (armazenamento cheio ou bloqueado)."); }
  }
  function restore() {
    if (!confirm("Descartar as mudanças salvas e voltar para a versão publicada (arquivos)?")) return;
    try { localStorage.removeItem("cp_data"); } catch (e) {}
    location.reload();
  }
  var _t;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(_t); _t = setTimeout(function () { t.classList.remove("show"); }, 3800);
  }

  /* ---------------- add buttons ---------------- */
  function wireAdd() {
    $("#addProd").addEventListener("click", function () {
      state.produtos.push({ id: "produto-" + (state.produtos.length + 1), nome: "", descricao: "", imagem: "", preco: 0, sabores: [], ativo: true });
      renderProdutos(); markDirty();
    });
    $("#addRev").addEventListener("click", function () {
      state.reviews.push({ nome: "", local: "", nota: 5, texto: "" });
      renderReviews(); markDirty();
    });
    $("#addFaq").addEventListener("click", function () {
      state.faq.push({ q: "", a: "" });
      renderFaq(); markDirty();
    });
  }

  /* ---------------- export ---------------- */
  function slug(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "produto"; }

  function buildProdutos() {
    // garante id em todos
    state.produtos.forEach(function (p) { if (!p.id) p.id = slug(p.nome); });
    return header("PRODUTOS — gerado pelo painel") + "window.PRODUTOS = " + pretty(state.produtos) + ";\n";
  }
  function buildReviews() { return header("DEPOIMENTOS — gerado pelo painel") + "window.DEPOIMENTOS = " + pretty(state.reviews) + ";\n"; }
  function buildFaq() { return header("FAQ — gerado pelo painel") + "window.FAQ = " + pretty(state.faq) + ";\n"; }
  function buildConfig() { return header("CONFIG — gerado pelo painel") + "window.CONFIG = " + pretty(state.config) + ";\n"; }
  function header(t) { return "/* " + t + " */\n"; }
  function pretty(o) { return JSON.stringify(o, null, 2); }

  function download(name, text) {
    var blob = new Blob([text], { type: "application/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  }

  function wireExports() {
    wireAdd();
    $("#dlProd").addEventListener("click", function () { download("produtos.js", buildProdutos()); });
    $("#dlRev").addEventListener("click", function () { download("depoimentos.js", buildReviews()); });
    $("#dlFaq").addEventListener("click", function () { download("faq.js", buildFaq()); });
    $("#dlCfg").addEventListener("click", function () { download("config.js", buildConfig()); });
    $("#dlAll").addEventListener("click", function () {
      download("produtos.js", buildProdutos());
      setTimeout(function () { download("depoimentos.js", buildReviews()); }, 250);
      setTimeout(function () { download("faq.js", buildFaq()); }, 500);
      setTimeout(function () { download("config.js", buildConfig()); }, 750);
    });
  }

  document.addEventListener("DOMContentLoaded", gate);
})();
