document.addEventListener("DOMContentLoaded", () => {

  let activeCategory = "todos";
  let cartList = [];

  const grid            = document.getElementById("products-grid");
  const modal           = document.getElementById("product-modal");
  const modalBody       = document.getElementById("modal-body");
  const closeBtn        = document.getElementById("modal-close");
  const filterBtns      = document.querySelectorAll(".filter-btn");
  const searchInput     = document.getElementById("search-input");
  const cartCount       = document.getElementById("cart-count");
  const cartToggle      = document.getElementById("cart-toggle");
  const cartDrawer      = document.getElementById("cart-drawer");
  const cartOverlay     = document.getElementById("cart-overlay");
  const cartDrawerClose = document.getElementById("cart-drawer-close");
  const cartDrawerBody  = document.getElementById("cart-drawer-body");
  const cartDrawerFoot  = document.getElementById("cart-drawer-footer");

  function badgeClass(b) {
    return b === "Oferta" ? "oferta" : b === "Nuevo" ? "nuevo" : "top";
  }
  function catLabel(c) {
    const m = {
      pomadas: "Pomadas & Ceras",
      barba: "Cuidado de Barba",
      afeite: "Afeite",
      herramientas: "Herramientas",
      capilar: "Capilar"
    };
    return m[c] || c;
  }
  function parsePrecio(s) {
    return parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
  }

  const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

  // ── RENDER CARDS ──────────────────────────────────────────
  function renderProducts(list) {
    grid.innerHTML = "";

    if (!list.length) {
      grid.innerHTML = `<div class="no-results"><span>✂️</span><p>No se encontraron productos</p></div>`;
      return;
    }

    list.forEach(function(p) {

      // Imagen real o placeholder
      var imgHTML = p.image
        ? '<img src="' + p.image + '" alt="' + p.name + '" class="card-img" />'
        : '<div class="card-img-placeholder"><span class="placeholder-text">Foto próximamente</span></div>';

      var badgeHTML = p.badge
        ? '<span class="badge badge-' + badgeClass(p.badge) + '">' + p.badge + '</span>'
        : '';

      var card = document.createElement("div");
      card.className = "product-card";
      card.dataset.id = p.id;

      card.innerHTML =
        badgeHTML +
        '<div class="card-icon">' + p.icon + '</div>' +
        imgHTML +
        '<div class="card-body">' +
          '<span class="card-category">' + catLabel(p.category) + '</span>' +
          '<h3 class="card-title">' + p.name + '</h3>' +
          '<p class="card-price">' + p.price + '</p>' +
          '<button class="btn-ver" data-id="' + p.id + '">Ver producto</button>' +
        '</div>';

      grid.appendChild(card);
    });

    document.querySelectorAll(".btn-ver").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        openModal(parseInt(e.currentTarget.dataset.id));
      });
    });

    document.querySelectorAll(".product-card").forEach(function(card) {
      card.addEventListener("click", function() {
        openModal(parseInt(card.dataset.id));
      });
    });
  }

  // ── FILTROS ───────────────────────────────────────────────
  filterBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      filterBtns.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeCategory = btn.dataset.filter;
      applyFilters();
    });
  });

  searchInput.addEventListener("input", applyFilters);

  function applyFilters() {
    var q = searchInput.value.toLowerCase().trim();
    var filtered = products;
    if (activeCategory !== "todos") {
      filtered = filtered.filter(function(p) { return p.category === activeCategory; });
    }
    if (q) {
      filtered = filtered.filter(function(p) {
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      });
    }
    renderProducts(filtered);
  }

  // ── MODAL ─────────────────────────────────────────────────
  function openModal(id) {
    var p = products.find(function(x) { return x.id === id; });
    if (!p) return;

    var detailsHTML = p.details.map(function(d) {
      return '<li><span class="detail-dot">✔</span> ' + d + '</li>';
    }).join("");

    var waMsg  = encodeURIComponent("Hola! Me interesa: *" + p.name + "* (" + p.price + "). ¿Tienen disponibilidad?");
    var waLink = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + waMsg;

    // Imagen real o placeholder en modal
    var modalImgHTML = p.image
      ? '<img src="' + p.image + '" alt="' + p.name + '" class="modal-img" />'
      : '<div class="modal-img-placeholder"><span class="modal-icon">' + p.icon + '</span><p>Foto próximamente</p></div>';

    var badgeHTML = p.badge
      ? '<span class="badge badge-' + badgeClass(p.badge) + ' badge-modal">' + p.badge + '</span>'
      : '';

    modalBody.innerHTML =
      '<div class="modal-product">' +
        '<div class="modal-left">' +
          modalImgHTML +
          badgeHTML +
        '</div>' +
        '<div class="modal-right">' +
          '<span class="modal-category">' + catLabel(p.category) + '</span>' +
          '<h2 class="modal-title">' + p.name + '</h2>' +
          '<p class="modal-price">' + p.price + '</p>' +
          '<p class="modal-desc">' + p.description + '</p>' +
          '<ul class="modal-details">' + detailsHTML + '</ul>' +
          '<div class="modal-actions">' +
            '<a class="btn-whatsapp" href="' + waLink + '" target="_blank" rel="noopener">' +
              WA_SVG + ' Pedir por WhatsApp' +
            '</a>' +
            '<button class="btn-add-cart">🛒 Agregar al carrito</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    modalBody.querySelector(".btn-add-cart").addEventListener("click", function() {
      addToCart(p);
    });

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", function(e) {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") { closeModal(); closeCart(); }
  });

  // ── CARRITO — AGREGAR ─────────────────────────────────────
  function addToCart(p) {
    cartList.push(Object.assign({}, p, { cartId: Date.now() + Math.random() }));
    updateBadge();
    showToast("✔ " + p.name + " agregado al carrito");
    closeModal();
  }

  function updateBadge() {
    cartCount.textContent = cartList.length;
    cartCount.style.display = cartList.length > 0 ? "inline-flex" : "none";
  }

  // ── CARRITO — DRAWER ──────────────────────────────────────
  function openCart() {
    renderCart();
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  cartToggle.addEventListener("click", openCart);
  cartDrawerClose.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  function renderCart() {
    if (!cartList.length) {
      cartDrawerBody.innerHTML =
        '<div class="cart-empty">' +
          '<span>🛒</span>' +
          '<p>Tu carrito está vacío</p>' +
          '<small>Agrega productos para pedirlos por WhatsApp</small>' +
        '</div>';
      cartDrawerFoot.innerHTML = "";
      return;
    }

    cartDrawerBody.innerHTML = cartList.map(function(item) {
      var thumb = item.image
        ? '<img src="' + item.image + '" style="width:40px;height:40px;object-fit:contain;border-radius:6px;" />'
        : item.icon;
      return (
        '<div class="cart-item">' +
          '<div class="cart-item-icon">' + thumb + '</div>' +
          '<div class="cart-item-info">' +
            '<p class="cart-item-name">' + item.name + '</p>' +
            '<p class="cart-item-price">' + item.price + '</p>' +
          '</div>' +
          '<button class="cart-item-remove" data-cid="' + item.cartId + '">🗑</button>' +
        '</div>'
      );
    }).join("");

    cartDrawerBody.querySelectorAll(".cart-item-remove").forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        var cid = parseFloat(e.currentTarget.dataset.cid);
        cartList = cartList.filter(function(i) { return i.cartId !== cid; });
        updateBadge();
        renderCart();
      });
    });

    var total = cartList.reduce(function(s, i) { return s + parsePrecio(i.price); }, 0);
    var lista = cartList.map(function(i, idx) { return (idx + 1) + ". " + i.name + " — " + i.price; }).join("\n");
    var waMsg  = encodeURIComponent("Hola! Me interesan:\n\n" + lista + "\n\nTotal aprox: $" + total + ". ¿Tienen disponibilidad?");
    var waLink = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + waMsg;

    cartDrawerFoot.innerHTML =
      '<div class="cart-total">' +
        '<span class="cart-total-label">Total aprox.</span>' +
        '<span class="cart-total-price">$' + total + '</span>' +
      '</div>' +
      '<a class="btn-cart-whatsapp" href="' + waLink + '" target="_blank" rel="noopener">' +
        WA_SVG + ' Pedir todo por WhatsApp' +
      '</a>' +
      '<button class="btn-cart-clear" id="btn-clear">Vaciar carrito</button>';

    document.getElementById("btn-clear").addEventListener("click", function() {
      cartList = [];
      updateBadge();
      renderCart();
    });
  }

  // ── TOAST ─────────────────────────────────────────────────
  function showToast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.classList.add("show"); }, 10);
    setTimeout(function() {
      t.classList.remove("show");
      setTimeout(function() { t.remove(); }, 400);
    }, 2800);
  }

  // ── NAVBAR SCROLL ─────────────────────────────────────────
  window.addEventListener("scroll", function() {
    document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 50);
  });

  // ── SMOOTH SCROLL ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener("click", function(e) {
      var t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: "smooth" }); }
    });
  });

  // ── INIT ──────────────────────────────────────────────────
  renderProducts(products);

  // ── HAMBURGER MENU ────────────────────────────────────────
  var hamburger = document.getElementById("hamburger");
  var navLinks  = document.getElementById("nav-links");

  hamburger.addEventListener("click", function() {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(function(a) {
    a.addEventListener("click", function() {
      hamburger.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });
});