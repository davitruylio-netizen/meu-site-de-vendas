
const products = [
  {
    id: 1,
    name: "Pixel Heroes Pack",
    category: "Personagens",
    description: "Personagens pixel art com animações de combate e movimento.",
    price: 19.90,
    icon: "⚔️"
  },
  {
    id: 2,
    name: "Dark Forest",
    category: "Cenários",
    description: "Cenário de floresta sombria para jogos de aventura e terror.",
    price: 14.90,
    icon: "🌲"
  },
  {
    id: 3,
    name: "Combat Animations",
    category: "Animações",
    description: "Animações de ataque, defesa, corrida e movimentos especiais.",
    price: 24.90,
    icon: "💥"
  },
  {
    id: 4,
    name: "Fantasy UI Kit",
    category: "Interfaces",
    description: "Menus, botões, barras de vida e elementos de interface.",
    price: 12.90,
    icon: "🖥️"
  },
  {
    id: 5,
    name: "Dungeon World",
    category: "Cenários",
    description: "Tilesets e elementos para construir masmorras.",
    price: 17.90,
    icon: "🏰"
  },
  {
    id: 6,
    name: "Shadow Warriors",
    category: "Personagens",
    description: "Pacote de guerreiros com aparência sombria.",
    price: 29.90,
    icon: "🥷"
  }
];

let cart = [];
let selectedCategory = "Todos";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("search");
const cartCount = document.getElementById("cartCount");
const cartButton = document.getElementById("cartButton");

function formatPrice(price) {
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function renderProducts() {
  const term = searchInput.value.trim().toLowerCase();

  const filtered = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term);

    const matchesCategory =
      selectedCategory === "Todos" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML =
      '<p class="empty">Nenhum produto encontrado. Tente outra pesquisa.</p>';
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image">${product.icon}</div>

      <div class="product-info">
        <span class="tag">${product.category.toUpperCase()}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>

        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>

          <button class="add-button"
            onclick="addToCart(${product.id})">
            + Adicionar
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const product = products.find(item => item.id === id);

  if (!product) return;

  cart.push(product);
  updateCart();

  alert(product.name + " adicionado ao carrinho!");
}

function updateCart() {
  cartCount.textContent = cart.length;
}

function showCart() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  const total = cart.reduce(
    (sum, product) => sum + product.price, 0
  );

  const items = cart.map((product, index) =>
    `${index + 1}. ${product.name} - ${formatPrice(product.price)}`
  ).join("\n");

  alert(
    "SEU CARRINHO\n\n" +
    items +
    "\n\nTOTAL: " + formatPrice(total) +
    "\n\nCheckout será implementado em uma próxima etapa."
  );
}

searchInput.addEventListener("input", renderProducts);

document.querySelectorAll(".category-grid button")
  .forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      selectedCategory =
        selectedCategory === category ? "Todos" : category;

      document.querySelectorAll(".category-grid button")
        .forEach(item => item.classList.remove("active"));

      if (selectedCategory !== "Todos") {
        button.classList.add("active");
      }

      renderProducts();
    });
  });

cartButton.addEventListener("click", showCart);

renderProducts();
