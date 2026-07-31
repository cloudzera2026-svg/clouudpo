/* ============================================================
   Cloud Pods — app (render dinâmico + checkout WhatsApp)
   Vanilla JS, sem dependências.
   ============================================================ */
(function () {
  "use strict";

  /* Prévia local: se houver edições salvas no painel (localStorage), usa elas.
     Só afeta ESTE navegador — para todos verem, publique pelo painel (baixar/subir). */
  var _preview = false;
  try {
    var _saved = JSON.parse(localStorage.getItem("cp_data"));
    if (_saved) {
      if (_saved.produtos) window.PRODUTOS = _saved.produtos;
      if (_saved.reviews) window.DEPOIMENTOS = _saved.reviews;
      if (_saved.faq) window.FAQ = _saved.faq;
      if (_saved.config) window.CONFIG = Object.assign({}, window.CONFIG, _saved.config);
      _preview = true;
    }
  } catch (e) {}

  var CFG = window.CONFIG || {};
  var PRODUTOS = (window.PRODUTOS || []).filter(function (p) { return p.ativo !== false; });
  var DEPOIMENTOS = window.DEPOIMENTOS || [];

  /* FAQ vem de assets/js/faq.js (window.FAQ) */
  var FAQ = window.FAQ || [];

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || document).querySelector(s); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function brl(n) { return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  function iniciais(nome) {
    var p = String(nome).trim().split(/\s+/);
    return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || "");
  }
  var waNumber = digits(CFG.whatsapp);

  /* ---------- acento vindo do CONFIG ---------- */
  (function accent() {
    var r = document.documentElement.style;
    if (CFG.acentoCor)  r.setProperty("--accent", CFG.acentoCor);
    if (CFG.acentoCor2) r.setProperty("--accent-2", CFG.acentoCor2);
  })();

  /* ---------- identidade / textos ---------- */
  function fillIdentity() {
    document.querySelectorAll("[data-loja]").forEach(function (n) { n.textContent = CFG.loja || "Loja"; });
    document.querySelectorAll("[data-cidade]").forEach(function (n) { n.textContent = CFG.cidade || ""; });
    document.querySelectorAll("[data-logo]").forEach(function (n) { if (CFG.logo) n.src = CFG.logo; });
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- produtos ---------- */
  function renderProdutos() {
    var grid = $("#productsGrid");
    if (!grid) return;
    if (!PRODUTOS.length) { grid.innerHTML = '<p style="color:var(--muted);grid-column:1/-1;text-align:center">Novos produtos em breve.</p>'; return; }

    PRODUTOS.forEach(function (p, i) {
      var card = el("article", "glass card reveal" + (p.destaque ? " destaque" : ""));
      card.style.transitionDelay = (i % 3) * 70 + "ms";

      var off = p.precoDe && p.precoDe > p.preco
        ? Math.round((1 - p.preco / p.precoDe) * 100) : 0;

      var flavors = (p.sabores || []).slice(0, 3).map(function (s) {
        return '<span>' + s + '</span>';
      }).join("");
      var extra = (p.sabores || []).length - 3;
      if (extra > 0) flavors += '<span class="more">+' + extra + '</span>';

      card.innerHTML =
        '<div class="card-media">' +
          (p.badge ? '<span class="badge">' + p.badge + '</span>' : '') +
          (off ? '<span class="badge badge-off">-' + off + '%</span>' : '') +
          '<img loading="lazy" decoding="async" src="' + p.imagem + '" alt="' + p.nome + '">' +
        '</div>' +
        '<div class="card-body">' +
          '<h3>' + p.nome + '</h3>' +
          '<p class="desc">' + p.descricao + '</p>' +
          (flavors ? '<div class="flavors-mini">' + flavors + '</div>' : '') +
          '<div class="price">' +
            '<span class="now">' + brl(p.preco) + '</span>' +
            (p.precoDe && p.precoDe > p.preco ? '<span class="old">' + brl(p.precoDe) + '</span>' : '') +
            (off ? '<span class="save">-' + off + '%</span>' : '') +
          '</div>' +
          '<button class="btn btn-primary btn-block" data-buy="' + p.id + '">Comprar agora</button>' +
        '</div>';

      grid.appendChild(card);
    });

    grid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-buy]");
      if (b) openCheckout(b.getAttribute("data-buy"));
    });
  }

  /* ---------- frete ---------- */
  function renderFrete() {
    var hrs = $("#freteHorarios");
    if (hrs && CFG.horariosFreteGratis) {
      hrs.innerHTML = CFG.horariosFreteGratis.map(function (h) { return "<span>" + h + "</span>"; }).join("");
    }
    var tb = $("#freteTableBody");
    if (tb && CFG.freteExpresso) {
      tb.innerHTML = CFG.freteExpresso.map(function (f) {
        return "<tr><td>" + f.bairro + "</td><td>" + f.tempo + "</td><td>" + brl(f.valor) + "</td></tr>";
      }).join("");
    }
  }

  /* ---------- depoimentos ---------- */
  function renderReviews() {
    var track = $("#reviewsTrack");
    var dotsC = $("#reviewsDots");
    if (!track) return;

    DEPOIMENTOS.forEach(function (d) {
      var stars = "★★★★★".slice(0, d.nota) + "☆☆☆☆☆".slice(0, 5 - d.nota);
      var av = d.foto
        ? '<span class="avatar"><img src="' + d.foto + '" alt="' + d.nome + '"></span>'
        : '<span class="avatar">' + iniciais(d.nome).toUpperCase() + "</span>";
      var card = el("article", "glass review reveal");
      card.innerHTML =
        '<div class="top">' + av +
          '<div class="who"><b>' + d.nome + "</b><span>" + (d.local || "") + "</span></div>" +
        "</div>" +
        '<div class="stars" aria-label="' + d.nota + " de 5\">" + stars + "</div>" +
        "<p>" + d.texto + "</p>";
      track.appendChild(card);
    });

    if (dotsC) {
      DEPOIMENTOS.forEach(function (_, i) {
        var dot = el("i"); if (i === 0) dot.className = "active";
        dotsC.appendChild(dot);
      });
      var cards = track.children;
      track.addEventListener("scroll", function () {
        var idx = Math.round(track.scrollLeft / (track.scrollWidth / DEPOIMENTOS.length));
        Array.prototype.forEach.call(dotsC.children, function (d, i) {
          d.className = i === Math.min(idx, DEPOIMENTOS.length - 1) ? "active" : "";
        });
      }, { passive: true });

      // autoplay leve
      var auto = setInterval(function () {
        if (document.hidden) return;
        var next = Math.round(track.scrollLeft / cards[0].offsetWidth) + 1;
        if (next >= cards.length) next = 0;
        track.scrollTo({ left: next * (cards[0].offsetWidth + 16), behavior: "smooth" });
      }, 4500);
      track.addEventListener("pointerdown", function () { clearInterval(auto); }, { once: true });
    }
  }

  /* ---------- FAQ ---------- */
  function renderFaq() {
    var list = $("#faqList");
    if (!list) return;
    FAQ.forEach(function (f) {
      var item = el("div", "glass faq-item reveal");
      item.innerHTML =
        '<button class="faq-q" aria-expanded="false"><span>' + f.q + '</span><span class="ico">+</span></button>' +
        '<div class="faq-a"><p>' + f.a + "</p></div>";
      list.appendChild(item);
    });
    list.addEventListener("click", function (e) {
      var q = e.target.closest(".faq-q");
      if (!q) return;
      var item = q.parentElement;
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open);
      var a = $(".faq-a", item);
      a.style.maxHeight = open ? a.scrollHeight + "px" : 0;
    });
  }

  /* ---------- contador ---------- */
  function countdown() {
    var grid = $("#countGrid");
    if (!grid || !CFG.countdownAte) return;
    var alvo = new Date(CFG.countdownAte).getTime();
    var t = $("#countTitle"); if (t && CFG.countdownTitulo) t.textContent = CFG.countdownTitulo;
    var cells = [["dias", "Dias"], ["horas", "Horas"], ["min", "Min"], ["seg", "Seg"]];
    grid.innerHTML = cells.map(function (c) {
      return '<div class="glass count-cell"><b id="cd-' + c[0] + '">00</b><span>' + c[1] + "</span></div>";
    }).join("");
    function tick() {
      var diff = alvo - Date.now();
      if (diff < 0) diff = 0;
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600);  s -= h * 3600;
      var m = Math.floor(s / 60);    s -= m * 60;
      var pad = function (n) { return String(n).padStart(2, "0"); };
      $("#cd-dias").textContent = pad(d);
      $("#cd-horas").textContent = pad(h);
      $("#cd-min").textContent = pad(m);
      $("#cd-seg").textContent = pad(s);
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- WhatsApp links fixos ---------- */
  function wireWhatsApp() {
    var msg = encodeURIComponent("Olá! Vim pelo site da " + (CFG.loja || "loja") + " e quero fazer um pedido 🛒");
    var base = "https://wa.me/" + waNumber + "?text=" + msg;
    document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = base; });
  }

  function wireInstagram() {
    var ig = String(CFG.instagram || "").replace(/^@/, "");
    if (!ig) return;
    document.querySelectorAll("[data-ig]").forEach(function (a) {
      a.href = "https://instagram.com/" + ig;
      if (a.hasAttribute("data-ig-handle")) a.textContent = "@" + ig;
    });
  }

  /* ============================================================
     CHECKOUT (modal → WhatsApp)
     ============================================================ */
  var checkout = { produto: null, sabor: null, qtd: 1, pagamento: null };

  function openCheckout(id) {
    var p = PRODUTOS.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    checkout = { produto: p, sabor: (p.sabores || [])[0] || null, qtd: 1, pagamento: (CFG.pagamentos || [])[0] || null };

    $("#coImg").src = p.imagem;
    $("#coImg").alt = p.nome;
    $("#coNome").textContent = p.nome;
    $("#coPreco").textContent = brl(p.preco);

    // sabores
    var fc = $("#coSabores");
    var wrap = $("#coSaboresWrap");
    if (p.sabores && p.sabores.length) {
      wrap.style.display = "";
      fc.innerHTML = p.sabores.map(function (s, i) {
        return '<button type="button" class="chip' + (i === 0 ? " active" : "") + '" data-sabor="' + s + '">' + s + "</button>";
      }).join("");
    } else { wrap.style.display = "none"; }

    // pagamentos
    var pc = $("#coPag");
    pc.innerHTML = (CFG.pagamentos || []).map(function (s, i) {
      return '<button type="button" class="chip' + (i === 0 ? " active" : "") + '" data-pag="' + s + '">' + s + "</button>";
    }).join("");

    // bairros
    var sel = $("#coBairro");
    sel.innerHTML = '<option value="">Selecione o bairro…</option>' +
      (CFG.freteExpresso || []).map(function (f) { return '<option>' + f.bairro + "</option>"; }).join("");

    $("#coQtd").value = 1;
    updateTotal();
    clearErrors();
    document.body.style.overflow = "hidden";
    $("#checkout").classList.add("open");
  }

  function closeCheckout() {
    $("#checkout").classList.remove("open");
    document.body.style.overflow = "";
  }

  function updateTotal() {
    if (!checkout.produto) return;
    var total = checkout.produto.preco * checkout.qtd;
    $("#coTotal").textContent = brl(total);
  }

  function clearErrors() {
    document.querySelectorAll("#checkout .err").forEach(function (n) { n.classList.remove("err"); });
  }

  function wireCheckout() {
    var modal = $("#checkout");
    if (!modal) return;

    $("#coClose").addEventListener("click", closeCheckout);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeCheckout(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCheckout(); });

    // chips (sabor / pagamento)
    $("#coSabores").addEventListener("click", function (e) {
      var b = e.target.closest("[data-sabor]"); if (!b) return;
      $$active(this, b); checkout.sabor = b.getAttribute("data-sabor");
    });
    $("#coPag").addEventListener("click", function (e) {
      var b = e.target.closest("[data-pag]"); if (!b) return;
      $$active(this, b); checkout.pagamento = b.getAttribute("data-pag");
    });

    // quantidade
    $("#coMinus").addEventListener("click", function () { setQtd(checkout.qtd - 1); });
    $("#coPlus").addEventListener("click", function () { setQtd(checkout.qtd + 1); });
    $("#coQtd").addEventListener("input", function () { setQtd(parseInt(this.value, 10)); });

    // enviar
    $("#coSend").addEventListener("click", enviarPedido);
  }

  function $$active(container, btn) {
    Array.prototype.forEach.call(container.children, function (c) { c.classList.remove("active"); });
    btn.classList.add("active");
  }
  function setQtd(v) {
    if (isNaN(v) || v < 1) v = 1; if (v > 99) v = 99;
    checkout.qtd = v; $("#coQtd").value = v; updateTotal();
  }

  function enviarPedido() {
    clearErrors();
    var nome = $("#coCliente").value.trim();
    var rua = $("#coRua").value.trim();
    var numero = $("#coNumero").value.trim();
    var bairro = $("#coBairro").value;
    var comp = $("#coComp").value.trim();
    var ref = $("#coRef").value.trim();

    var ok = true;
    function bad(id) { $(id).classList.add("err"); ok = false; }
    if (!nome) bad("#coCliente");
    if (!rua) bad("#coRua");
    if (!numero) bad("#coNumero");
    if (!bairro) bad("#coBairro");
    if (!ok) { $("#coErr").style.display = "block"; return; }
    $("#coErr").style.display = "none";

    var p = checkout.produto;
    var total = p.preco * checkout.qtd;

    var linhas = [
      "Olá! Quero fazer um pedido 🛒",
      "",
      "*Produto:* " + p.nome,
      checkout.sabor ? "*Sabor:* " + checkout.sabor : null,
      "*Qtd:* " + checkout.qtd,
      "*Total:* " + brl(total),
      "",
      "*Nome:* " + nome,
      "*Endereço:* " + rua + ", " + numero + (comp ? " - " + comp : ""),
      "*Bairro:* " + bairro,
      ref ? "*Referência:* " + ref : null,
      "*Pagamento:* " + (checkout.pagamento || "-"),
    ].filter(Boolean);

    var url = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(linhas.join("\n"));
    window.open(url, "_blank");
  }

  /* ============================================================
     Navbar / menu mobile
     ============================================================ */
  function wireNav() {
    var nav = $("#nav");
    var burger = $("#burger");
    var menu = $("#mobileMenu");
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 12);
    }, { passive: true });
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        burger.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", open);
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) { menu.classList.remove("open"); burger.classList.remove("open"); }
      });
    }
  }

  /* ============================================================
     Reveal on scroll
     ============================================================ */
  function wireReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ============================================================
     Hero canvas — partículas leves (glow)
     ============================================================ */
  function heroFx() {
    var c = $("#fx");
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ctx = c.getContext("2d");
    var host = c.parentElement, dpr = Math.min(window.devicePixelRatio || 1, 2), parts = [], raf;
    var accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2dd4bf";

    function hexToRgb(h) {
      h = h.replace("#", "");
      if (h.length === 3) h = h.split("").map(function (x) { return x + x; }).join("");
      var n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    var rgb = hexToRgb(accent);

    function resize() {
      c.width = host.offsetWidth * dpr; c.height = host.offsetHeight * dpr;
      var count = Math.min(60, Math.floor(host.offsetWidth / 22));
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * c.width, y: Math.random() * c.height,
          r: (Math.random() * 2 + 0.6) * dpr,
          vx: (Math.random() - 0.5) * 0.25 * dpr,
          vy: (Math.random() - 0.5) * 0.25 * dpr,
          a: Math.random() * 0.5 + 0.15,
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, c.width, c.height);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    resize(); draw();
    var to; window.addEventListener("resize", function () { clearTimeout(to); to = setTimeout(resize, 200); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf); else draw();
    });
  }

  /* ============================================================
     Age gate (+18)
     ============================================================ */
  function ageGate() {
    var gate = $("#ageGate");
    if (!gate) return;
    try { if (localStorage.getItem("cp_age_ok") === "1") return; } catch (e) {}
    gate.classList.add("show");
    document.body.style.overflow = "hidden";
    $("#ageYes").addEventListener("click", function () {
      try { localStorage.setItem("cp_age_ok", "1"); } catch (e) {}
      gate.classList.remove("show"); document.body.style.overflow = "";
    });
    $("#ageNo").addEventListener("click", function () {
      window.location.href = "https://www.google.com";
    });
  }

  function previewFlag() {
    if (!_preview) return;
    var f = el("div", "preview-flag");
    f.innerHTML = "👁 Prévia local ativa — <b>publique no painel</b> para todos verem &nbsp;·&nbsp; <span id='pvClear'>limpar</span>";
    document.body.appendChild(f);
    var c = $("#pvClear");
    if (c) c.addEventListener("click", function () {
      try { localStorage.removeItem("cp_data"); } catch (e) {}
      location.reload();
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    previewFlag();
    fillIdentity();
    renderProdutos();
    renderFrete();
    renderReviews();
    renderFaq();
    countdown();
    wireWhatsApp();
    wireInstagram();
    wireCheckout();
    wireNav();
    heroFx();
    ageGate();
    wireReveal();
  });
})();
