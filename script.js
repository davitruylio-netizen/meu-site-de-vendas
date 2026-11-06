
/* =========================================
   PIXELFORGE — SISTEMA PRINCIPAL
   ========================================= */

/*
  IMPORTANTE:
  Esta versão funciona no navegador usando JavaScript.
  Os produtos e o carrinho são demonstrativos.
  Não existe pagamento real nem entrega automática ainda.
*/

// =========================================
// 1. CADASTRO DOS CINCO PRODUTOS INICIAIS
// =========================================

const products = [
  {
    id: 1,
    name: "2D Game Starter",
    category: "Jogos",
    price: 3.90,
    icon: "🎮",
    tag: "DESTAQUE",
    color: "#8b5cf6",

    description:
      "Um kit inicial para quem deseja criar jogos de plataforma 2D. Reúne elementos visuais de cenários e personagens para ajudar você a começar seu projeto.",

    details: [
      "350 arquivos nos pacotes de origem",
      "Personagens e cenários",
      "Estilo 2D"
    ],

    contents: [
      "Kenney Pixel Platformer",
      "Kenney Platformer Characters"
    ],

    links: [
      "https://kenney.nl/assets/pixel-platformer",
      "https://kenney.nl/assets/platformer-characters"
    ]
  },

  {
    id: 2,
    name: "RPG Pixel Collection",
    category: "Artes e pixel art",
    price: 2.90,
    icon: "🏰",
    tag: "MAIS CONTEÚDO",
    color: "#22c55e",

    description:
      "Coleção visual para projetos de RPG e jogos de aventura. Inclui elementos gráficos para criar mapas, ambientes, construções e cenários em pixel art.",

    details: [
      "Aproximadamente 1.700 arquivos",
      "Tiles de 16 × 16",
      "Estilo RPG"
    ],

    contents: [
      "Kenney Roguelike/RPG Pack"
    ],

    links: [
      "https://kenney.nl/assets/roguelike-rpg-pack"
    ]
  },

  {
    id: 3,
    name: "Platformer Assets",
    category: "Assets e animações",
    price: 3.90,
    icon: "🧩",
    tag: "PARA CRIADORES",
    color: "#f59e0b",

    description:
      "Pacote de recursos gráficos para jogos de plataforma. Ideal para desenvolver cenários, personagens e elementos visuais de projetos 2D.",

    details: [
      "Aproximadamente 440 arquivos",
      "Recursos para plataforma",
      "Elementos gráficos"
    ],

    contents: [
      "Kenney New Platformer Pack"
    ],

    links: [
      "https://kenney.nl/assets/new-platformer-pack"
    ]
  },

  {
    id: 4,
    name: "Game Audio Collection",
    category: "Músicas e efeitos sonoros",
    price: 2.90,
    icon: "🎵",
    tag: "ÁUDIO",
    color: "#ec4899",

    description:
      "Coleção de recursos sonoros para jogos e aplicações. Reúne efeitos de impacto, sons de interface, jingles e sons digitais.",

    details: [
      "375 arquivos nos pacotes de origem",
      "Efeitos e sons de interface",
      "Áudio para jogos"
    ],

    contents: [
      "Kenney Impact Sounds",
      "Kenney Interface Sounds",
      "Kenney Music Jingles",
      "Kenney Digital Audio"
    ],

    links: [
      "https://kenney.nl/assets/impact-sounds",
      "https://kenney.nl/assets/interface-sounds",
      "https://kenney.nl/assets/music-jingles",
      "https://kenney.nl/assets/digital-audio"
    ]
  },

  {
    id: 5,
    name: "Game UI Toolkit",
    category: "Templates e ferramentas",
    price: 3.90,
    icon: "🛠️",
    tag: "FERRAMENTAS",
    color: "#06b6d4",

    description:
      "Recursos gráficos para desenvolver interfaces de jogos. Ideal para criar menus, botões, painéis, barras e outros componentes visuais.",

    details: [
      "Aproximadamente 430 arquivos",
      "Menus e botões",
      "Elementos de interface"
    ],

    contents: [
      "Kenney UI Pack"
    ],

    links: [
      "https://kenney.nl/assets/ui-pack"
    ]
  }
];


// =========================================
// 2. ELEMENTOS DA PÁGINA
// =========================================

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("search");
const emptyState = document.getElementById("emptyState");

const activeFilterLabel = document.getElementById("activeFilterLabel");

const categoryButtons = document.querySelectorAll(".category-card");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");

const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");

const cartItemsContainer = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");

const checkoutButton = document.getElementById("checkoutButton");

const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");

const clearFiltersButton = document.getElementById("clearFilters");


// =========================================
// 3. ESTADO DA LOJA
// =========================================

let selectedCategory = "Todos";
let searchTerm = "";

let cart = loadCart();


// =========================================
// 4. FUNÇÕES DE ARMAZENAMENTO
// =========================================

function loadCart() {
  try {
    const savedCart = localStorage.getItem("pixelforge_cart");

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    // Mantém apenas produtos que ainda existem.
    return parsedCart.filter(item => {
      return products.some(product => product.id === item.id);
    });

  } catch (error) {
    console.error("Erro ao carregar carrinho:", error);
    return [];
  }
}


function saveCart() {
  try {
    localStorage.setItem("pixelforge_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Não foi possível salvar o carrinho:", error);
  }
}


// =========================================
// 5. FORMATAÇÃO DE PREÇOS
// =========================================

function formatPrice(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


// =========================================
// 6. CRIAÇÃO DOS PRODUTOS
// =========================================

function renderProducts() {

  if (!productGrid) return;

  productGrid.innerHTML = "";

  const filteredProducts = products.filter(product => {

    const matchesCategory =
      selectedCategory === "Todos" ||
      product.category === selectedCategory;

    const searchableText = [
      product.name,
      product.category,
      product.description,
      ...product.details,
      ...product.contents
    ].join(" ").toLowerCase();

    const matchesSearch = searchableText.includes(
      searchTerm.toLowerCase()
    );

    return matchesCategory && matchesSearch;
  });


  // Atualiza o texto do filtro.
  if (activeFilterLabel) {

    if (selectedCategory === "Todos") {
      activeFilterLabel.textContent =
        `Exibindo ${filteredProducts.length} produto(s)`;
    } else {
      activeFilterLabel.textContent =
        `${selectedCategory}: ${filteredProducts.length} produto(s)`;
    }

  }


  // Mostra estado vazio.
  if (filteredProducts.length === 0) {

    emptyState.hidden = false;
    productGrid.hidden = true;

    return;

  }

  emptyState.hidden = true;
  productGrid.hidden = false;


  // Monta cada card.
  filteredProducts.forEach(product => {

    const card = document.createElement("article");

    card.className = "product-card";

    card.innerHTML = `
      <div
        class="product-art"
        style="--art-color: ${product.color}"
      >

        <span class="product-tag">
          ${product.tag}
        </span>

        <span class="art-symbol">
          ${product.icon}
        </span>

      </div>

      <div class="product-info">

        <span class="product-category">
          ${product.category}
        </span>

        <h3>${product.name}</h3>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="product-details">
          ${product.details.map(detail => `
            <span class="detail-pill">
              ${detail}
            </span>
          `).join("")}
        </div>

        <div class="product-footer">

          <div class="product-price">
            <strong>${formatPrice(product.price)}</strong>
            <small>Preço demonstrativo</small>
          </div>

          <button
            class="add-cart-button"
            data-add-product="${product.id}"
          >
            + Adicionar
          </button>

        </div>

      </div>
    `;

    productGrid.appendChild(card);

  });

}


// =========================================
// 7. FILTRO DE CATEGORIAS
// =========================================

categoryButtons.forEach(button => {

  button.addEventListener("click", () => {

    selectedCategory = button.dataset.category;

    categoryButtons.forEach(categoryButton => {
      categoryButton.classList.remove("active");
    });

    button.classList.add("active");

    renderProducts();

  });

});


// =========================================
// 8. PESQUISA DE PRODUTOS
// =========================================

if (searchInput) {

  searchInput.addEventListener("input", event => {

    searchTerm = event.target.value.trim();

    renderProducts();

  });

}


// =========================================
// 9. LIMPAR FILTROS
// =========================================

if (clearFiltersButton) {

  clearFiltersButton.addEventListener("click", () => {

    selectedCategory = "Todos";
    searchTerm = "";

    if (searchInput) {
      searchInput.value = "";
    }

    categoryButtons.forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.category === "Todos"
      );

    });

    renderProducts();

  });

}


// =========================================
// 10. ADICIONAR AO CARRINHO
// =========================================

if (productGrid) {

  productGrid.addEventListener("click", event => {

    const button = event.target.closest("[data-add-product]");

    if (!button) return;

    const productId = Number(button.dataset.addProduct);

    addToCart(productId);

  });

}


function addToCart(productId) {

  const product = products.find(item => item.id === productId);

  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {

    existingItem.quantity += 1;

  } else {

    cart.push({
      id: productId,
      quantity: 1
    });

  }

  saveCart();

  updateCart();

  showButtonFeedback(productId);

}


function showButtonFeedback(productId) {

  const button = document.querySelector(
    `[data-add-product="${productId}"]`
  );

  if (!button) return;

  const originalText = button.textContent;

  button.textContent = "✓ Adicionado";
  button.style.background = "#16a34a";

  setTimeout(() => {

    button.textContent = originalText;
    button.style.background = "";

  }, 1000);

}


// =========================================
// 11. ATUALIZAR CARRINHO
// =========================================

function updateCart() {

  const totalItems = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  if (cartCount) {
    cartCount.textContent = totalItems;
  }

  renderCart();

}


function calculateTotal() {

  return cart.reduce((sum, item) => {

    const product = products.find(product => {
      return product.id === item.id;
    });

    if (!product) return sum;

    return sum + product.price * item.quantity;

  }, 0);

}


// =========================================
// 12. MOSTRAR ITENS DO CARRINHO
// =========================================

function renderCart() {

  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {

    cartEmpty.hidden = false;

  } else {

    cartEmpty.hidden = true;

  }


  cart.forEach(item => {

    const product = products.find(product => {
      return product.id === item.id;
    });

    if (!product) return;

    const cartItem = document.createElement("div");

    cartItem.className = "cart-item";

    cartItem.innerHTML = `

      <div class="cart-item-info">

        <strong>${product.name}</strong>

        <span>
          ${item.quantity} × ${formatPrice(product.price)}
        </span>

      </div>

      <div class="cart-item-actions">

        <strong>
          ${formatPrice(product.price * item.quantity)}
        </strong>

        <button
          class="remove-item"
          data-remove-product="${product.id}"
          aria-label="Remover ${product.name}"
        >
          ×
        </button>

      </div>

    `;

    cartItemsContainer.appendChild(cartItem);

  });


  if (cartTotal) {
    cartTotal.textContent = formatPrice(calculateTotal());
  }

}


// =========================================
// 13. REMOVER PRODUTOS
// =========================================

if (cartItemsContainer) {

  cartItemsContainer.addEventListener("click", event => {

    const button = event.target.closest("[data-remove-product]");

    if (!button) return;

    const productId = Number(button.dataset.removeProduct);

    removeFromCart(productId);

  });

}


function removeFromCart(productId) {

  cart = cart.filter(item => item.id !== productId);

  saveCart();

  updateCart();

}


// =========================================
// 14. ABRIR E FECHAR CARRINHO
// =========================================

function openCart() {

  cartModal.classList.add("open");

  cartModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

}


function closeCartModal() {

  cartModal.classList.remove("open");

  cartModal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

}


if (cartButton) {

  cartButton.addEventListener("click", openCart);

}


if (closeCart) {

  closeCart.addEventListener("click", closeCartModal);

}


if (cartModal) {

  cartModal.addEventListener("click", event => {

    if (event.target === cartModal) {
      closeCartModal();
    }

  });

}


document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeCartModal();
  }

});


// =========================================
// 15. BOTÃO DE PAGAMENTO
// =========================================

if (checkoutButton) {

  checkoutButton.addEventListener("click", () => {

    if (cart.length === 0) {

      alert("Seu carrinho está vazio!");

      return;

    }

    alert(
      "O carrinho está funcionando! " +
      "A integração de pagamento será desenvolvida em uma próxima etapa."
    );

  });

}


// =========================================
// 16. MENU PARA CELULAR
// =========================================

if (mobileMenuButton && mobileMenu) {

  mobileMenuButton.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

  });

  mobileMenu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mobileMenu.classList.remove("open");

    });

  });

}


// =========================================
// 17. INICIALIZAÇÃO
// =========================================

function initializePixelForge() {

  renderProducts();

  updateCart();

  console.log("PixelForge iniciado com sucesso!");

  console.log(`${products.length} produtos cadastrados.`);

}


// Inicia a aplicação.
initializePixelForge();
