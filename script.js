
/* ==========================================================
   PIXELFORGE — SISTEMA COMPLETO DO MARKETPLACE
   Versão: 2.0
   ==========================================================

   FUNCIONALIDADES:
   1. Catálogo de produtos
   2. Pesquisa inteligente
   3. Filtros por categoria
   4. Carrinho de compras
   5. Área de cadastro do vendedor
   6. Painel de controle do vendedor
   7. Publicação de produtos digitais
   8. Upload e armazenamento local de arquivos
   9. Edição e exclusão de produtos
   10. Calculadora de comissão
   11. Painel financeiro demonstrativo
   12. Salvamento automático no navegador

   LIMITAÇÃO:
   Esta é uma versão front-end.
   Não existe pagamento real, login seguro ou servidor.
   Os arquivos ficam no navegador deste dispositivo.
   ========================================================== */


// ==========================================================
// 1. CONFIGURAÇÕES GERAIS
// ==========================================================

const PF_CONFIG = {
  platformName: "PixelForge",

  sellerPercentage: 90,
  platformPercentage: 10,

  currency: "BRL",

  storagePrefix: "pixelforge_v2_",

  databaseName: "PixelForgeDatabase",
  databaseVersion: 1
};


const PF_CATEGORIES = [
  "Jogos",
  "Artes e pixel art",
  "Assets e animações",
  "Músicas e efeitos sonoros",
  "Templates e ferramentas"
];


// ==========================================================
// 2. PRODUTOS INICIAIS
// ==========================================================

const initialProducts = [
  {
    id: "pf-initial-001",
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
    ],

    origin: "PixelForge",
    type: "initial"
  },

  {
    id: "pf-initial-002",
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
    ],

    origin: "PixelForge",
    type: "initial"
  },

  {
    id: "pf-initial-003",
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
    ],

    origin: "PixelForge",
    type: "initial"
  },

  {
    id: "pf-initial-004",
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
    ],

    origin: "PixelForge",
    type: "initial"
  },

  {
    id: "pf-initial-005",
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
    ],

    origin: "PixelForge",
    type: "initial"
  }
];


// ==========================================================
// 3. FERRAMENTAS DE ARMAZENAMENTO
// ==========================================================

function pfGetStorage(key, fallback) {
  try {
    const value = localStorage.getItem(
      PF_CONFIG.storagePrefix + key
    );

    return value === null ? fallback : JSON.parse(value);

  } catch (error) {
    console.error("Erro ao ler armazenamento:", error);
    return fallback;
  }
}


function pfSetStorage(key, value) {
  try {
    localStorage.setItem(
      PF_CONFIG.storagePrefix + key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {
    console.error("Erro ao salvar dados:", error);

    pfToast(
      "Não foi possível salvar. Verifique o espaço disponível.",
      "error"
    );

    return false;
  }
}


function pfMoney(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: PF_CONFIG.currency
  });
}


function pfEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}


function pfCreateId(prefix = "product") {
  return (
    prefix + "-" +
    Date.now().toString(36) + "-" +
    Math.random().toString(36).slice(2, 9)
  );
}


// ==========================================================
// 4. ESTADO PRINCIPAL
// ==========================================================

let sellerProducts = pfGetStorage("seller_products", []);

let sellerProfile = pfGetStorage("seller_profile", null);

let cart = pfGetStorage("cart", []);

let currentCategory = "Todos";

let currentSearch = "";

let sellerCurrentTab = "overview";

let editingProductId = null;

let productBeingViewed = null;


// ==========================================================
// 5. PRODUTOS DISPONÍVEIS
// ==========================================================

function pfGetAllProducts() {
  return [
    ...initialProducts,
    ...sellerProducts.filter(product => product.status !== "deleted")
  ];
}


function pfFindProduct(productId) {
  return pfGetAllProducts().find(product => {
    return product.id === productId;
  });
}


// ==========================================================
// 6. BANCO LOCAL DE ARQUIVOS — INDEXEDDB
// ==========================================================

let pfDatabase = null;


function pfOpenDatabase() {

  return new Promise((resolve, reject) => {

    if (!window.indexedDB) {
      reject(new Error("Este navegador não suporta armazenamento de arquivos."));
      return;
    }

    const request = indexedDB.open(
      PF_CONFIG.databaseName,
      PF_CONFIG.databaseVersion
    );

    request.onupgradeneeded = event => {

      const database = event.target.result;

      if (!database.objectStoreNames.contains("productFiles")) {

        database.createObjectStore("productFiles", {
          keyPath: "id"
        });

      }

    };

    request.onsuccess = event => {

      pfDatabase = event.target.result;

      resolve(pfDatabase);

    };

    request.onerror = () => {
      reject(request.error);
    };

  });

}


function pfSaveFile(fileId, file) {

  return new Promise((resolve, reject) => {

    if (!pfDatabase) {
      reject(new Error("Banco local indisponível."));
      return;
    }

    const transaction = pfDatabase.transaction(
      "productFiles",
      "readwrite"
    );

    const store = transaction.objectStore("productFiles");

    const request = store.put({
      id: fileId,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file
    });

    request.onsuccess = () => resolve(true);

    request.onerror = () => reject(request.error);

  });

}


function pfGetFile(fileId) {

  return new Promise((resolve, reject) => {

    if (!pfDatabase) {
      reject(new Error("Banco local indisponível."));
      return;
    }

    const transaction = pfDatabase.transaction(
      "productFiles",
      "readonly"
    );

    const store = transaction.objectStore("productFiles");

    const request = store.get(fileId);

    request.onsuccess = () => resolve(request.result || null);

    request.onerror = () => reject(request.error);

  });

}


function pfDeleteFile(fileId) {

  return new Promise((resolve, reject) => {

    if (!pfDatabase) {
      resolve(false);
      return;
    }

    const transaction = pfDatabase.transaction(
      "productFiles",
      "readwrite"
    );

    const store = transaction.objectStore("productFiles");

    const request = store.delete(fileId);

    request.onsuccess = () => resolve(true);

    request.onerror = () => reject(request.error);

  });

}


// ==========================================================
// 7. ESTILOS EXTRAS DA NOVA ÁREA
// ==========================================================

function pfInstallStyles() {

  if (document.getElementById("pixelforge-extra-styles")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "pixelforge-extra-styles";

  style.textContent = `

    .pf-workspace {
      width: min(1200px, 92%);
      margin: 70px auto;
      padding: 28px;
      border: 1px solid rgba(139,92,246,.28);
      border-radius: 22px;
      background: linear-gradient(145deg,#17152b,#10101d);
      scroll-margin-top: 95px;
    }

    .pf-workspace-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:20px;
      margin-bottom:25px;
      flex-wrap:wrap;
    }

    .pf-workspace-title {
      font-size:27px;
      font-weight:900;
      letter-spacing:-1px;
    }

    .pf-workspace-subtitle {
      color:#9998b1;
      font-size:12px;
      margin-top:5px;
    }

    .pf-seller-badge {
      padding:8px 12px;
      border:1px solid rgba(74,222,128,.25);
      border-radius:20px;
      background:rgba(74,222,128,.08);
      color:#4ade80;
      font-size:10px;
      font-weight:800;
    }

    .pf-tabs {
      display:flex;
      gap:8px;
      overflow-x:auto;
      padding-bottom:12px;
      border-bottom:1px solid rgba(255,255,255,.08);
    }

    .pf-tab {
      flex-shrink:0;
      padding:11px 15px;
      border:1px solid transparent;
      border-radius:9px;
      background:transparent;
      color:#aaa9bf;
      font-size:11px;
      font-weight:800;
      cursor:pointer;
    }

    .pf-tab:hover,
    .pf-tab.active {
      background:#292342;
      border-color:rgba(139,92,246,.4);
      color:white;
    }

    .pf-workspace-body {
      padding-top:25px;
    }

    .pf-metric-grid {
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:13px;
    }

    .pf-metric {
      padding:20px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:14px;
      background:#111120;
    }

    .pf-metric-label {
      color:#9998b1;
      font-size:10px;
    }

    .pf-metric-value {
      margin-top:9px;
      font-size:25px;
      font-weight:900;
      overflow-wrap:anywhere;
    }

    .pf-metric-note {
      margin-top:5px;
      color:#77768f;
      font-size:9px;
    }

    .pf-panel {
      margin-top:18px;
      padding:21px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:14px;
      background:#111120;
    }

    .pf-panel h3 {
      margin-bottom:15px;
      font-size:15px;
    }

    .pf-panel p {
      color:#aaa9bf;
      font-size:11px;
      line-height:1.8;
    }

    .pf-action-row {
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin-top:18px;
    }

    .pf-button {
      min-height:40px;
      padding:0 15px;
      border:1px solid rgba(255,255,255,.12);
      border-radius:9px;
      background:#292342;
      color:white;
      font-size:11px;
      font-weight:800;
      cursor:pointer;
    }

    .pf-button.primary {
      border:0;
      background:linear-gradient(110deg,#8b5cf6,#6841d0);
    }

    .pf-button.danger {
      background:rgba(244,63,94,.1);
      border-color:rgba(244,63,94,.3);
      color:#fb7185;
    }

    .pf-button:hover {
      filter:brightness(1.15);
      transform:translateY(-1px);
    }

    .pf-form {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:15px;
    }

    .pf-field {
      display:flex;
      flex-direction:column;
      gap:7px;
    }

    .pf-field.full {
      grid-column:1/-1;
    }

    .pf-field label {
      color:#c5c4d6;
      font-size:11px;
      font-weight:700;
    }

    .pf-field input,
    .pf-field select,
    .pf-field textarea {
      width:100%;
      min-height:43px;
      padding:11px 12px;
      border:1px solid rgba(255,255,255,.12);
      border-radius:9px;
      background:#0b0b17;
      color:white;
      font:inherit;
      font-size:12px;
    }

    .pf-field textarea {
      min-height:110px;
      resize:vertical;
    }

    .pf-field input:focus,
    .pf-field select:focus,
    .pf-field textarea:focus {
      outline:2px solid rgba(139,92,246,.7);
      outline-offset:1px;
    }

    .pf-field input[type="file"] {
      padding:9px;
    }

    .pf-help {
      color:#85849e;
      font-size:9px;
      line-height:1.6;
    }

    .pf-product-list {
      display:grid;
      gap:10px;
    }

    .pf-managed-product {
      padding:14px;
      display:flex;
      align-items:center;
      gap:13px;
      border:1px solid rgba(255,255,255,.08);
      border-radius:12px;
      background:#111120;
    }

    .pf-managed-icon {
      width:48px;
      height:48px;
      display:grid;
      place-items:center;
      flex-shrink:0;
      border-radius:10px;
      background:#292342;
      font-size:24px;
    }

    .pf-managed-info {
      flex:1;
      min-width:0;
    }

    .pf-managed-info strong {
      display:block;
      font-size:12px;
    }

    .pf-managed-info span {
      display:block;
      margin-top:4px;
      color:#9998b1;
      font-size:10px;
    }

    .pf-managed-actions {
      display:flex;
      flex-wrap:wrap;
      gap:6px;
    }

    .pf-small-button {
      padding:7px 9px;
      border:1px solid rgba(255,255,255,.1);
      border-radius:7px;
      background:#222138;
      color:white;
      font-size:9px;
      font-weight:800;
      cursor:pointer;
    }

    .pf-empty {
      padding:30px 15px;
      border:1px dashed rgba(255,255,255,.15);
      border-radius:12px;
      color:#9998b1;
      text-align:center;
      font-size:12px;
    }

    .pf-finance-bar {
      height:13px;
      display:flex;
      overflow:hidden;
      margin:15px 0;
      border-radius:20px;
      background:#292342;
    }

    .pf-finance-seller {
      width:90%;
      background:#4ade80;
    }

    .pf-finance-platform {
      width:10%;
      background:#8b5cf6;
    }

    .pf-commission-row {
      display:flex;
      justify-content:space-between;
      gap:10px;
      padding:12px 0;
      border-bottom:1px solid rgba(255,255,255,.07);
      font-size:11px;
    }

    .pf-commission-row span {
      color:#aaa9bf;
    }

    .pf-toast-container {
      position:fixed;
      right:18px;
      bottom:18px;
      z-index:9999;
      display:grid;
      gap:9px;
      width:min(340px,calc(100% - 36px));
    }

    .pf-toast {
      padding:14px 16px;
      border:1px solid rgba(255,255,255,.12);
      border-radius:11px;
      background:#1b1b2d;
      color:white;
      box-shadow:0 10px 30px rgba(0,0,0,.35);
      font-size:11px;
      animation:pfToastIn .2s ease-out;
    }

    .pf-toast.error {
      border-color:rgba(244,63,94,.5);
    }

    .pf-toast.success {
      border-color:rgba(74,222,128,.4);
    }

    .pf-detail-overlay {
      position:fixed;
      inset:0;
      z-index:500;
      padding:20px;
      display:none;
      align-items:center;
      justify-content:center;
      background:rgba(0,0,0,.8);
      backdrop-filter:blur(7px);
    }

    .pf-detail-overlay.open {
      display:flex;
    }

    .pf-detail-box {
      width:min(560px,100%);
      max-height:90vh;
      overflow-y:auto;
      padding:25px;
      border:1px solid rgba(255,255,255,.12);
      border-radius:18px;
      background:#121222;
    }

    .pf-detail-icon {
      padding:25px;
      margin-bottom:18px;
      border-radius:12px;
      background:#24213c;
      text-align:center;
      font-size:55px;
    }

    .pf-detail-links {
      display:grid;
      gap:8px;
      margin-top:15px;
    }

    .pf-detail-links a {
      color:#22d3ee;
      font-size:11px;
      overflow-wrap:anywhere;
    }

    .pf-register {
      max-width:650px;
      margin:auto;
      padding:25px;
      border:1px solid rgba(139,92,246,.25);
      border-radius:16px;
      background:#111120;
    }

    .pf-register h3 {
      margin-bottom:8px;
      font-size:20px;
    }

    .pf-register > p {
      margin-bottom:20px;
      color:#aaa9bf;
      font-size:11px;
      line-height:1.7;
    }

    .pf-file-status {
      color:#4ade80;
      font-size:10px;
    }

    @keyframes pfToastIn {
      from { opacity:0; transform:translateY(10px); }
      to { opacity:1; transform:translateY(0); }
    }

    @media(max-width:850px) {
      .pf-metric-grid {
        grid-template-columns:repeat(2,1fr);
      }
    }

    @media(max-width:600px) {
      .pf-workspace {
        padding:18px 13px;
      }

      .pf-workspace-title {
        font-size:22px;
      }

      .pf-metric {
        padding:14px;
      }

      .pf-metric-value {
        font-size:20px;
      }

      .pf-form {
        grid-template-columns:1fr;
      }

      .pf-field.full {
        grid-column:auto;
      }

      .pf-managed-product {
        align-items:flex-start;
        flex-wrap:wrap;
      }

      .pf-managed-actions {
        width:100%;
        padding-left:60px;
      }

      .pf-detail-box {
        padding:18px;
      }
    }

  `;

  document.head.appendChild(style);

}


// ==========================================================
// 8. CRIAR A ÁREA DE TRABALHO
// ==========================================================

function pfCreateWorkspace() {

  if (document.getElementById("pfWorkspace")) {
    return;
  }

  const sellerSection = document.getElementById("vender");

  if (!sellerSection) {
    console.error("Seção de vendedor não encontrada.");
    return;
  }

  const workspace = document.createElement("section");

  workspace.id = "pfWorkspace";
  workspace.className = "pf-workspace";

  workspace.innerHTML = `
    <div class="pf-workspace-header">

      <div>
        <span class="section-eyebrow">CENTRAL DO CRIADOR</span>

        <h2 class="pf-workspace-title">
          Área de trabalho
        </h2>

        <p class="pf-workspace-subtitle">
          Gerencie sua loja e seus produtos em um só lugar.
        </p>
      </div>

      <span class="pf-seller-badge">
        ● PAINEL DO VENDEDOR
      </span>

    </div>

    <div id="pfWorkspaceContent"></div>
  `;

  sellerSection.insertAdjacentElement("afterend", workspace);

  pfInstallStyles();

  pfRenderWorkspace();

}


// ==========================================================
// 9. SISTEMA DE NOTIFICAÇÕES
// ==========================================================

function pfToast(message, type = "success") {

  let container = document.getElementById("pfToastContainer");

  if (!container) {

    container = document.createElement("div");

    container.id = "pfToastContainer";
    container.className = "pf-toast-container";

    document.body.appendChild(container);

  }

  const toast = document.createElement("div");

  toast.className = `pf-toast ${type}`;

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);

}


// ==========================================================
// 10. CADASTRO DO VENDEDOR
// ==========================================================

function pfRenderWorkspace() {

  const content = document.getElementById("pfWorkspaceContent");

  if (!content) return;

  if (!sellerProfile) {

    content.innerHTML = `
      <div class="pf-register">

        <span class="section-eyebrow">
          COMECE A VENDER
        </span>

        <h3>Crie sua loja no PixelForge</h3>

        <p>
          Cadastre seu perfil de criador para acessar seu painel,
          publicar produtos digitais e acompanhar seus resultados.
        </p>

        <form id="pfSellerRegister" class="pf-form">

          <div class="pf-field full">
            <label for="pfSellerName">
              Nome da sua loja ou criador
            </label>

            <input
              id="pfSellerName"
              name="sellerName"
              type="text"
              maxlength="60"
              placeholder="Ex.: Davi Games Studio"
              required
            >
          </div>

          <div class="pf-field full">
            <label for="pfSellerEmail">
              E-mail de contato
            </label>

            <input
              id="pfSellerEmail"
              name="sellerEmail"
              type="email"
              maxlength="120"
              placeholder="voce@email.com"
              required
            >
          </div>

          <div class="pf-field full">
            <span class="pf-help">
              Este cadastro é local e demonstrativo. Ainda não cria
              uma conta protegida nem registra dados no servidor.
            </span>
          </div>

          <div class="pf-field full">
            <button class="pf-button primary" type="submit">
              Criar minha loja →
            </button>
          </div>

        </form>

      </div>
    `;

    return;
  }

  pfRenderSellerPanel();

}


// ==========================================================
// 11. PAINEL DO VENDEDOR
// ==========================================================

function pfRenderSellerPanel() {

  const content = document.getElementById("pfWorkspaceContent");

  if (!content) return;

  const tabs = [
    ["overview", "▦ Visão geral"],
    ["products", "▤ Meus produtos"],
    ["new", "＋ Novo produto"],
    ["finance", "◈ Financeiro"],
    ["settings", "⚙ Minha loja"]
  ];

  content.innerHTML = `

    <div class="pf-tabs">

      ${tabs.map(tab => `
        <button
          class="pf-tab ${sellerCurrentTab === tab[0] ? "active" : ""}"
          data-pf-tab="${tab[0]}"
        >
          ${tab[1]}
        </button>
      `).join("")}

    </div>

    <div class="pf-workspace-body" id="pfTabContent"></div>

  `;

  pfRenderActiveTab();

}


function pfRenderActiveTab() {

  const tabContent = document.getElementById("pfTabContent");

  if (!tabContent) return;

  if (sellerCurrentTab === "overview") {
    pfRenderOverview(tabContent);
  }

  if (sellerCurrentTab === "products") {
    pfRenderManagedProducts(tabContent);
  }

  if (sellerCurrentTab === "new") {
    pfRenderProductForm(tabContent);
  }

  if (sellerCurrentTab === "finance") {
    pfRenderFinance(tabContent);
  }

  if (sellerCurrentTab === "settings") {
    pfRenderSettings(tabContent);
  }

}


// ==========================================================
// 12. VISÃO GERAL DO VENDEDOR
// ==========================================================

function pfRenderOverview(container) {

  const totalProducts = sellerProducts.length;

  const activeProducts = sellerProducts.filter(product => {
    return product.status === "active";
  }).length;

  const draftProducts = sellerProducts.filter(product => {
    return product.status === "draft";
  }).length;

  const totalRevenue = 0;

  const sellerEarnings =
    totalRevenue * PF_CONFIG.sellerPercentage / 100;

  container.innerHTML = `

    <div class="pf-metric-grid">

      <div class="pf-metric">
        <div class="pf-metric-label">Meus produtos</div>
        <div class="pf-metric-value">${totalProducts}</div>
        <div class="pf-metric-note">Total cadastrado</div>
      </div>

      <div class="pf-metric">
        <div class="pf-metric-label">Publicados</div>
        <div class="pf-metric-value">${activeProducts}</div>
        <div class="pf-metric-note">Disponíveis na loja</div>
      </div>

      <div class="pf-metric">
        <div class="pf-metric-label">Rascunhos</div>
        <div class="pf-metric-value">${draftProducts}</div>
        <div class="pf-metric-note">Ainda não publicados</div>
      </div>

      <div class="pf-metric">
        <div class="pf-metric-label">Ganhos registrados</div>
        <div class="pf-metric-value">${pfMoney(sellerEarnings)}</div>
        <div class="pf-metric-note">Sem vendas reais registradas</div>
      </div>

    </div>

    <div class="pf-panel">

      <h3>Bem-vindo, ${pfEscape(sellerProfile.name)}!</h3>

      <p>
        Este é o centro de controle da sua loja.
        Aqui você poderá organizar seus produtos, acompanhar
        suas publicações e consultar os resultados das vendas.
      </p>

      <div class="pf-action-row">

        <button class="pf-button primary" data-pf-action="new">
          ＋ Publicar produto
        </button>

        <button class="pf-button" data-pf-action="products">
          Gerenciar produtos
        </button>

        <button class="pf-button" data-pf-action="finance">
          Consultar financeiro
        </button>

      </div>

    </div>

    <div class="pf-panel">

      <h3>Distribuição das vendas</h3>

      <p>
        A cada venda aprovada, a divisão planejada é de
        90% para o vendedor e 10% para o PixelForge.
      </p>

      <div class="pf-finance-bar">
        <div class="pf-finance-seller"></div>
        <div class="pf-finance-platform"></div>
      </div>

      <div class="pf-commission-row">
        <span>Você recebe</span>
        <strong>90%</strong>
      </div>

      <div class="pf-commission-row">
        <span>PixelForge</span>
        <strong>10%</strong>
      </div>

    </div>

    <div class="pf-panel">

      <h3>Próximos passos</h3>

      <p>
        1. Publique seu primeiro produto.<br>
        2. Organize os arquivos e as imagens de apresentação.<br>
        3. Revise os preços e as descrições.<br>
        4. Prepare sua loja para a futura integração de pagamentos.
      </p>

    </div>

  `;

}


// ==========================================================
// 13. GERENCIADOR DE PRODUTOS
// ==========================================================

function pfRenderManagedProducts(container) {

  if (sellerProducts.length === 0) {

    container.innerHTML = `

      <div class="pf-empty">
        <div style="font-size:32px;margin-bottom:10px">📦</div>

        <strong>Você ainda não publicou produtos.</strong>

        <p style="margin-top:8px">
          Comece cadastrando seu primeiro produto digital.
        </p>

        <div class="pf-action-row" style="justify-content:center">
          <button class="pf-button primary" data-pf-action="new">
            Criar primeiro produto
          </button>
        </div>
      </div>

    `;

    return;
  }


  container.innerHTML = `

    <div class="pf-panel" style="margin-top:0">

      <h3>Seus anúncios</h3>

      <p>
        Gerencie os produtos que você cadastrou na sua loja.
      </p>

    </div>

    <div class="pf-product-list">

      ${sellerProducts.map(product => `

        <div class="pf-managed-product">

          <div class="pf-managed-icon">
            ${pfEscape(product.icon || "📦")}
          </div>

          <div class="pf-managed-info">

            <strong>${pfEscape(product.name)}</strong>

            <span>
              ${pfEscape(product.category)}
              · ${pfMoney(product.price)}
              · ${product.status === "active" ? "Publicado" : "Rascunho"}
            </span>

            <span>
              ${product.fileName
                ? "Arquivo: " + pfEscape(product.fileName)
                : "Sem arquivo digital cadastrado"}
            </span>

          </div>

          <div class="pf-managed-actions">

            <button
              class="pf-small-button"
              data-pf-edit="${pfEscape(product.id)}"
            >
              Editar
            </button>

            <button
              class="pf-small-button"
              data-pf-download="${pfEscape(product.id)}"
            >
              Arquivo
            </button>

            <button
              class="pf-small-button"
              data-pf-toggle="${pfEscape(product.id)}"
            >
              ${product.status === "active" ? "Pausar" : "Publicar"}
            </button>

            <button
              class="pf-small-button"
              data-pf-delete="${pfEscape(product.id)}"
            >
              Excluir
            </button>

          </div>

        </div>

      `).join("")}

    </div>

    <div class="pf-action-row">

      <button class="pf-button primary" data-pf-action="new">
        ＋ Adicionar outro produto
      </button>

    </div>

  `;

}


// ==========================================================
// 14. FORMULÁRIO DE PUBLICAÇÃO
// ==========================================================

function pfRenderProductForm(container, productToEdit = null) {

  const editing = Boolean(productToEdit);

  editingProductId = editing ? productToEdit.id : null;

  const product = productToEdit || {};

  container.innerHTML = `

    <div class="pf-panel" style="margin-top:0">

      <span class="section-eyebrow">
        ${editing ? "ATUALIZAR ANÚNCIO" : "NOVO ANÚNCIO"}
      </span>

      <h3>
        ${editing ? "Editar produto" : "Publicar um produto digital"}
      </h3>

      <p>
        Preencha as informações do seu produto.
        Quanto melhor a descrição, mais fácil será para os compradores
        entenderem o que estão adquirindo.
      </p>

    </div>

    <form id="pfProductForm" class="pf-form">

      <div class="pf-field full">

        <label for="pfProductName">Nome do produto *</label>

        <input
          id="pfProductName"
          name="name"
          type="text"
          maxlength="80"
          value="${pfEscape(product.name || "")}"
          placeholder="Ex.: Pacote de personagens RPG"
          required
        >

      </div>

      <div class="pf-field">

        <label for="pfProductCategory">Categoria *</label>

        <select
          id="pfProductCategory"
          name="category"
          required
        >

          <option value="">Selecione uma categoria</option>

          ${PF_CATEGORIES.map(category => `
            <option
              value="${pfEscape(category)}"
              ${product.category === category ? "selected" : ""}
            >
              ${pfEscape(category)}
            </option>
          `).join("")}

        </select>

      </div>

      <div class="pf-field">

        <label for="pfProductPrice">Preço em reais *</label>

        <input
          id="pfProductPrice"
          name="price"
          type="number"
          min="0.50"
          max="10000"
          step="0.01"
          value="${product.price ?? ""}"
          placeholder="Ex.: 9.90"
          required
        >

      </div>

      <div class="pf-field">

        <label for="pfProductIcon">Ícone do produto</label>

        <select id="pfProductIcon" name="icon">

          ${[
            "📦","🎮","🎨","🧩","🎵","🛠️",
            "🏰","⚔️","👾","🚀","🌌","🖥️"
          ].map(icon => `
            <option
              value="${icon}"
              ${product.icon === icon ? "selected" : ""}
            >
              ${icon}
            </option>
          `).join("")}

        </select>

      </div>

      <div class="pf-field">

        <label for="pfProductTag">Etiqueta</label>

        <select id="pfProductTag" name="tag">

          ${[
            "NOVO",
            "DESTAQUE",
            "RECOMENDADO",
            "OFERTA",
            "EXCLUSIVO"
          ].map(tag => `
            <option
              value="${tag}"
              ${product.tag === tag ? "selected" : ""}
            >
              ${tag}
            </option>
          `).join("")}

        </select>

      </div>

      <div class="pf-field full">

        <label for="pfProductDescription">
          Descrição completa *
        </label>

        <textarea
          id="pfProductDescription"
          name="description"
          maxlength="1200"
          placeholder="Explique o que o comprador receberá, para que serve e como poderá usar o produto..."
          required
        >${pfEscape(product.description || "")}</textarea>

        <span class="pf-help">
          Escreva uma descrição clara. Não prometa arquivos,
          recursos ou funcionalidades que não estejam incluídos.
        </span>

      </div>

      <div class="pf-field full">

        <label for="pfProductDetails">
          O que está incluído?
        </label>

        <textarea
          id="pfProductDetails"
          name="details"
          maxlength="600"
          placeholder="Ex.: 20 sprites, 5 cenários, arquivos PNG..."
        >${pfEscape((product.details || []).join("\n"))}</textarea>

        <span class="pf-help">
          Coloque um item por linha.
        </span>

      </div>

      <div class="pf-field full">

        <label for="pfProductFile">
          Arquivo digital do produto ${editing ? "(opcional para manter o atual)" : "*"}
        </label>

        <input
          id="pfProductFile"
          name="productFile"
          type="file"
          ${editing ? "" : "required"}
        >

        <span class="pf-help">
          Aceita arquivos digitais comuns, incluindo ZIP, imagens,
          áudio, documentos e projetos. Tamanho máximo desta versão:
          100 MB por arquivo.
        </span>

        <span id="pfFileStatus" class="pf-file-status">
          ${product.fileName
            ? "Arquivo atual: " + pfEscape(product.fileName)
            : "Nenhum arquivo selecionado."}
        </span>

      </div>

      <div class="pf-field full">

        <label>
          Publicação
        </label>

        <select name="status">

          <option
            value="active"
            ${product.status !== "draft" ? "selected" : ""}
          >
            Publicar na loja
          </option>

          <option
            value="draft"
            ${product.status === "draft" ? "selected" : ""}
          >
            Salvar como rascunho
          </option>

        </select>

      </div>

      <div class="pf-field full">

        <div class="pf-panel" style="margin:0">

          <h3>Como funciona a divisão?</h3>

          <div class="pf-commission-row">
            <span>Seu recebimento bruto por venda aprovada</span>
            <strong>90%</strong>
          </div>

          <div class="pf-commission-row">
            <span>Comissão da plataforma</span>
            <strong>10%</strong>
          </div>

          <p style="margin-top:10px">
            Nesta regra, a plataforma assume as taxas do processador
            de pagamento. O cálculo é apenas demonstrativo até a
            integração financeira.
          </p>

        </div>

      </div>

      <div class="pf-field full">

        <div class="pf-action-row">

          <button class="pf-button primary" type="submit">
            ${editing ? "Salvar alterações" : "Cadastrar produto"}
          </button>

          <button
            class="pf-button"
            type="button"
            data-pf-action="products"
          >
            Cancelar
          </button>

        </div>

      </div>

    </form>

  `;

}


// ==========================================================
// 15. SALVAR UM PRODUTO
// ==========================================================

async function pfHandleProductSubmit(event) {

  event.preventDefault();

  const form = event.currentTarget;

  const formData = new FormData(form);

  const name = String(formData.get("name") || "").trim();

  const category = String(formData.get("category") || "");

  const price = Number(formData.get("price"));

  const description = String(
    formData.get("description") || ""
  ).trim();

  const icon = String(formData.get("icon") || "📦");

  const tag = String(formData.get("tag") || "NOVO");

  const status = String(formData.get("status") || "active");

  const details = String(
    formData.get("details") || ""
  ).split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 20);

  const fileInput = form.querySelector("#pfProductFile");

  const file = fileInput?.files?.[0] || null;

  if (name.length < 3) {
    pfToast("O nome precisa ter pelo menos 3 caracteres.", "error");
    return;
  }

  if (!PF_CATEGORIES.includes(category)) {
    pfToast("Selecione uma categoria válida.", "error");
    return;
  }

  if (!Number.isFinite(price) || price < 0.50 || price > 10000) {
    pfToast("Informe um preço entre R$ 0,50 e R$ 10.000.", "error");
    return;
  }

  if (description.length < 20) {
    pfToast("Escreva uma descrição com pelo menos 20 caracteres.", "error");
    return;
  }

  if (file && file.size > 100 * 1024 * 1024) {
    pfToast("O arquivo ultrapassa o limite de 100 MB.", "error");
    return;
  }

  const existingProduct = editingProductId
    ? sellerProducts.find(product => product.id === editingProductId)
    : null;

  if (!existingProduct && !file) {
    pfToast("Selecione o arquivo digital do produto.", "error");
    return;
  }

  const productId = existingProduct
    ? existingProduct.id
    : pfCreateId("seller");

  let fileName = existingProduct?.fileName || "";
  let fileId = existingProduct?.fileId || "";

  if (file) {

    try {

      fileId = productId;
      fileName = file.name;

      await pfSaveFile(fileId, file);

    } catch (error) {

      console.error(error);

      pfToast(
        "Não foi possível armazenar o arquivo neste navegador.",
        "error"
      );

      return;
    }

  }

  const newProduct = {
    id: productId,
    name,
    category,
    price,
    icon,
    tag,
    color: existingProduct?.color || "#8b5cf6",
    description,
    details,
    contents: [fileName || "Produto digital"],
    links: [],
    fileId,
    fileName,
    fileSize: file?.size || existingProduct?.fileSize || 0,
    status,
    origin: sellerProfile.name,
    sellerId: sellerProfile.id,
    type: "seller",
    updatedAt: new Date().toISOString(),
    createdAt: existingProduct?.createdAt || new Date().toISOString()
  };

  if (existingProduct) {

    sellerProducts = sellerProducts.map(product => {
      return product.id === productId ? newProduct : product;
    });

  } else {

    sellerProducts.unshift(newProduct);

  }

  const saved = pfSetStorage("seller_products", sellerProducts);

  if (!saved) return;

  editingProductId = null;

  pfRenderProducts();

  sellerCurrentTab = "products";

  pfRenderSellerPanel();

  pfToast(
    existingProduct
      ? "Produto atualizado com sucesso!"
      : "Produto cadastrado com sucesso!"
  );

}


// ==========================================================
// 16. EDITAR PRODUTO
// ==========================================================

function pfEditProduct(productId) {

  const product = sellerProducts.find(item => {
    return item.id === productId;
  });

  if (!product) {
    pfToast("Produto não encontrado.", "error");
    return;
  }

  sellerCurrentTab = "new";

  pfRenderSellerPanel();

  const tabContent = document.getElementById("pfTabContent");

  pfRenderProductForm(tabContent, product);

  document.getElementById("pfWorkspace").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


// ==========================================================
// 17. PAUSAR E PUBLICAR PRODUTOS
// ==========================================================

function pfToggleProduct(productId) {

  sellerProducts = sellerProducts.map(product => {

    if (product.id !== productId) {
      return product;
    }

    return {
      ...product,
      status: product.status === "active" ? "draft" : "active"
    };

  });

  pfSetStorage("seller_products", sellerProducts);

  pfRenderProducts();

  pfRenderSellerPanel();

  pfToast("Status do produto atualizado.");

}


// ==========================================================
// 18. EXCLUIR PRODUTO
// ==========================================================

async function pfDeleteProduct(productId) {

  const product = sellerProducts.find(item => {
    return item.id === productId;
  });

  if (!product) return;

  const confirmed = confirm(
    `Deseja realmente excluir "${product.name}"?`
  );

  if (!confirmed) return;

  sellerProducts = sellerProducts.filter(item => {
    return item.id !== productId;
  });

  pfSetStorage("seller_products", sellerProducts);

  if (product.fileId) {
    try {
      await pfDeleteFile(product.fileId);
    } catch (error) {
      console.warn("Não foi possível excluir o arquivo:", error);
    }
  }

  cart = cart.filter(item => item.id !== productId);

  pfSetStorage("cart", cart);

  pfRenderProducts();

  pfUpdateCart();

  pfRenderSellerPanel();

  pfToast("Produto excluído.");

}


// ==========================================================
// 19. BAIXAR ARQUIVO DO VENDEDOR
// ==========================================================

async function pfDownloadProductFile(productId) {

  const product = sellerProducts.find(item => {
    return item.id === productId;
  });

  if (!product || !product.fileId) {

    pfToast("Este produto não possui arquivo cadastrado.", "error");

    return;
  }

  try {

    const storedFile = await pfGetFile(product.fileId);

    if (!storedFile || !storedFile.blob) {

      pfToast(
        "Arquivo não encontrado neste navegador.",
        "error"
      );

      return;
    }

    const url = URL.createObjectURL(storedFile.blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = storedFile.name || "produto-digital";

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1500);

    pfToast("Download iniciado.");

  } catch (error) {

    console.error(error);

    pfToast("Erro ao baixar o arquivo.", "error");

  }

}


// ==========================================================
// 20. CENTRAL FINANCEIRA
// ==========================================================

function pfRenderFinance(container) {

  const grossSales = 0;

  const sellerAmount =
    grossSales * PF_CONFIG.sellerPercentage / 100;

  const platformAmount =
    grossSales * PF_CONFIG.platformPercentage / 100;

  container.innerHTML = `

    <div class="pf-panel" style="margin-top:0">

      <span class="section-eyebrow">FINANCEIRO</span>

      <h3>Resumo dos seus ganhos</h3>

      <p>
        Esta área apresentará suas vendas aprovadas,
        valores a receber e histórico financeiro quando
        o sistema de pagamentos estiver integrado.
      </p>

    </div>

    <div class="pf-metric-grid">

      <div class="pf-metric">
        <div class="pf-metric-label">Vendas aprovadas</div>
        <div class="pf-metric-value">0</div>
        <div class="pf-metric-note">Nenhuma venda real registrada</div>
      </div>

      <div class="pf-metric">
        <div class="pf-metric-label">Valor vendido</div>
        <div class="pf-metric-value">${pfMoney(grossSales)}</div>
        <div class="pf-metric-note">Valor bruto demonstrativo</div>
      </div>

      <div class="pf-metric">
        <div class="pf-metric-label">Sua participação</div>
        <div class="pf-metric-value">${pfMoney(sellerAmount)}</div>
        <div class="pf-metric-note">90% das vendas aprovadas</div>
      </div>

      <div class="pf-metric">
        <div class="pf-metric-label">Comissão da plataforma</div>
        <div class="pf-metric-value">${pfMoney(platformAmount)}</div>
        <div class="pf-metric-note">10% das vendas aprovadas</div>
      </div>

    </div>

    <div class="pf-panel">

      <h3>Simulador de venda</h3>

      <p>
        Digite um preço para visualizar quanto você receberia
        e quanto ficaria com a plataforma.
      </p>

      <div class="pf-field" style="margin-top:15px">

        <label for="pfSimulatorPrice">
          Preço anunciado (R$)
        </label>

        <input
          type="number"
          id="pfSimulatorPrice"
          min="0"
          step="0.01"
          value="10.00"
        >

      </div>

      <div class="pf-commission-row">
        <span>Seu recebimento (90%)</span>
        <strong id="pfSimulatorSeller">R$ 9,00</strong>
      </div>

      <div class="pf-commission-row">
        <span>PixelForge (10%)</span>
        <strong id="pfSimulatorPlatform">R$ 1,00</strong>
      </div>

      <p style="margin-top:12px">
        A taxa do processador de pagamento ainda não está
        incluída no simulador. Pela regra escolhida, ela será
        assumida pela plataforma e descontada da parte dela.
      </p>

    </div>

    <div class="pf-panel">

      <h3>Histórico de pagamentos</h3>

      <div class="pf-empty">
        Nenhuma transação registrada.
        O histórico será conectado ao gateway de pagamento
        em uma etapa futura.
      </div>

    </div>

  `;

  pfUpdateSimulator();

}


// ==========================================================
// 21. SIMULADOR DE COMISSÃO
// ==========================================================

function pfUpdateSimulator() {

  const input = document.getElementById("pfSimulatorPrice");

  const sellerOutput = document.getElementById("pfSimulatorSeller");

  const platformOutput = document.getElementById("pfSimulatorPlatform");

  if (!input || !sellerOutput || !platformOutput) return;

  const price = Math.max(0, Number(input.value) || 0);

  const sellerValue =
    price * PF_CONFIG.sellerPercentage / 100;

  const platformValue =
    price * PF_CONFIG.platformPercentage / 100;

  sellerOutput.textContent = pfMoney(sellerValue);

  platformOutput.textContent = pfMoney(platformValue);

}


// ==========================================================
// 22. CONFIGURAÇÕES DA LOJA
// ==========================================================

function pfRenderSettings(container) {

  container.innerHTML = `

    <div class="pf-panel" style="margin-top:0">

      <h3>Configurações da loja</h3>

      <p>
        Atualize as informações básicas do seu perfil de vendedor.
      </p>

    </div>

    <form id="pfSettingsForm" class="pf-form">

      <div class="pf-field full">

        <label for="pfSettingsName">Nome da loja</label>

        <input
          id="pfSettingsName"
          name="name"
          type="text"
          maxlength="60"
          value="${pfEscape(sellerProfile.name)}"
          required
        >

      </div>

      <div class="pf-field full">

        <label for="pfSettingsEmail">E-mail de contato</label>

        <input
          id="pfSettingsEmail"
          name="email"
          type="email"
          maxlength="120"
          value="${pfEscape(sellerProfile.email)}"
          required
        >

      </div>

      <div class="pf-field full">

        <button class="pf-button primary" type="submit">
          Salvar configurações
        </button>

      </div>

    </form>

    <div class="pf-panel">

      <h3>Dados e armazenamento</h3>

      <p>
        Os dados desta demonstração ficam salvos neste navegador.
        Limpar os dados do site pode apagar suas informações.
        Não utilize este protótipo para guardar dados bancários,
        documentos ou informações sensíveis.
      </p>

    </div>

    <div class="pf-panel">

      <h3>Encerrar perfil local</h3>

      <p>
        Esta ação apaga o perfil de vendedor e os produtos
        cadastrados neste navegador.
      </p>

      <div class="pf-action-row">

        <button class="pf-button danger" data-pf-action="reset-seller">
          Apagar perfil e produtos
        </button>

      </div>

    </div>

  `;

}


// ==========================================================
// 23. CADASTRAR PERFIL
// ==========================================================

function pfHandleSellerRegister(event) {

  event.preventDefault();

  const form = event.currentTarget;

  const formData = new FormData(form);

  const name = String(formData.get("sellerName") || "").trim();

  const email = String(formData.get("sellerEmail") || "").trim();

  if (name.length < 2) {
    pfToast("Digite um nome válido para sua loja.", "error");
    return;
  }

  if (!email.includes("@")) {
    pfToast("Digite um e-mail válido.", "error");
    return;
  }

  sellerProfile = {
    id: pfCreateId("seller-profile"),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  if (!pfSetStorage("seller_profile", sellerProfile)) {
    sellerProfile = null;
    return;
  }

  sellerCurrentTab = "overview";

  pfRenderWorkspace();

  pfToast("Sua loja foi criada neste navegador!");

}


// ==========================================================
// 24. SALVAR CONFIGURAÇÕES
// ==========================================================

function pfHandleSettings(event) {

  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const name = String(formData.get("name") || "").trim();

  const email = String(formData.get("email") || "").trim();

  if (name.length < 2 || !email.includes("@")) {

    pfToast("Confira o nome e o e-mail.", "error");

    return;
  }

  sellerProfile = {
    ...sellerProfile,
    name,
    email
  };

  pfSetStorage("seller_profile", sellerProfile);

  pfToast("Configurações atualizadas!");

  pfRenderSellerPanel();

}


// ==========================================================
// 25. EXCLUIR PERFIL LOCAL
// ==========================================================

async function pfResetSeller() {

  const confirmed = confirm(
    "Isso apagará seu perfil e todos os seus produtos cadastrados neste navegador. Deseja continuar?"
  );

  if (!confirmed) return;

  for (const product of sellerProducts) {

    if (product.fileId) {
      try {
        await pfDeleteFile(product.fileId);
      } catch (error) {
        console.warn(error);
      }
    }

  }

  sellerProducts = [];

  sellerProfile = null;

  pfSetStorage("seller_products", []);

  pfSetStorage("seller_profile", null);

  sellerCurrentTab = "overview";

  pfRenderProducts();

  pfRenderWorkspace();

  pfToast("Perfil local apagado.");

}


// ==========================================================
// 26. CATÁLOGO DE PRODUTOS
// ==========================================================

function pfRenderProducts() {

  const grid = document.getElementById("productGrid");

  const emptyState = document.getElementById("emptyState");

  const activeLabel = document.getElementById("activeFilterLabel");

  if (!grid) return;

  const allProducts = pfGetAllProducts();

  const visibleProducts = allProducts.filter(product => {

    if (product.status === "draft") {
      return false;
    }

    const categoryMatch =
      currentCategory === "Todos" ||
      product.category === currentCategory;

    const searchable = [
      product.name,
      product.category,
      product.description,
      ...(product.details || [])
    ].join(" ").toLowerCase();

    const searchMatch = searchable.includes(
      currentSearch.toLowerCase()
    );

    return categoryMatch && searchMatch;

  });


  grid.innerHTML = "";

  if (visibleProducts.length === 0) {

    grid.hidden = true;

    if (emptyState) {
      emptyState.hidden = false;
    }

  } else {

    grid.hidden = false;

    if (emptyState) {
      emptyState.hidden = true;
    }

  }


  if (activeLabel) {

    activeLabel.textContent =
      currentCategory === "Todos"
        ? `Exibindo ${visibleProducts.length} produto(s)`
        : `${currentCategory}: ${visibleProducts.length} produto(s)`;

  }


  visibleProducts.forEach(product => {

    const card = document.createElement("article");

    card.className = "product-card";

    card.innerHTML = `

      <div
        class="product-art"
        style="--art-color:${pfEscape(product.color || "#8b5cf6")}"
      >

        <span class="product-tag">
          ${pfEscape(product.tag || "NOVO")}
        </span>

        <span class="art-symbol">
          ${pfEscape(product.icon || "📦")}
        </span>

      </div>

      <div class="product-info">

        <span class="product-category">
          ${pfEscape(product.category)}
        </span>

        <h3>${pfEscape(product.name)}</h3>

        <p class="product-description">
          ${pfEscape(product.description)}
        </p>

        <div class="product-details">

          ${(product.details || []).slice(0, 3).map(detail => `
            <span class="detail-pill">
              ${pfEscape(detail)}
            </span>
          `).join("")}

        </div>

        <div class="product-footer">

          <div class="product-price">
            <strong>${pfMoney(product.price)}</strong>
            <small>Produto digital</small>
          </div>

          <button
            class="add-cart-button"
            data-pf-add-cart="${pfEscape(product.id)}"
          >
            + Adicionar
          </button>

        </div>

        <button
          class="pf-small-button"
          style="margin-top:10px;width:100%;padding:10px"
          data-pf-details="${pfEscape(product.id)}"
        >
          Ver detalhes do produto
        </button>

      </div>

    `;

    grid.appendChild(card);

  });

}


// ==========================================================
// 27. DETALHES DO PRODUTO
// ==========================================================

function pfCreateDetailsModal() {

  if (document.getElementById("pfDetailOverlay")) {
    return;
  }

  const overlay = document.createElement("div");

  overlay.id = "pfDetailOverlay";
  overlay.className = "pf-detail-overlay";

  overlay.innerHTML = `
    <div class="pf-detail-box" id="pfDetailBox"></div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", event => {

    if (event.target === overlay) {
      pfCloseDetails();
    }

  });

}


function pfShowDetails(productId) {

  const product = pfFindProduct(productId);

  if (!product) return;

  productBeingViewed = productId;

  pfCreateDetailsModal();

  const overlay = document.getElementById("pfDetailOverlay");

  const box = document.getElementById("pfDetailBox");

  const isSellerProduct = product.type === "seller";

  box.innerHTML = `

    <div style="display:flex;justify-content:space-between;align-items:center">

      <span class="section-eyebrow">DETALHES DO PRODUTO</span>

      <button class="close-modal" data-pf-action="close-details">
        ×
      </button>

    </div>

    <div class="pf-detail-icon">
      ${pfEscape(product.icon || "📦")}
    </div>

    <span class="product-category">
      ${pfEscape(product.category)}
    </span>

    <h2 style="margin-top:8px;font-size:24px">
      ${pfEscape(product.name)}
    </h2>

    <p style="margin-top:12px;color:#aaa9bf;font-size:12px;line-height:1.8">
      ${pfEscape(product.description)}
    </p>

    <div class="pf-panel">

      <h3>O que está incluído</h3>

      ${(product.details || []).map(detail => `
        <div class="pf-commission-row">
          <span>✓ ${pfEscape(detail)}</span>
        </div>
      `).join("")}

      ${(product.contents || []).map(item => `
        <div class="pf-commission-row">
          <span>${pfEscape(item)}</span>
        </div>
      `).join("")}

    </div>

    ${isSellerProduct ? "" : `
      <div class="pf-detail-links">

        <strong style="font-size:11px">
          Páginas dos pacotes de origem:
        </strong>

        ${(product.links || []).map(link => `
          <a
            href="${pfEscape(link)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            ${pfEscape(link)}
          </a>
        `).join("")}

      </div>
    `}

    <div class="pf-action-row" style="justify-content:space-between;align-items:center">

      <strong style="font-size:23px">
        ${pfMoney(product.price)}
      </strong>

      <button
        class="pf-button primary"
        data-pf-add-cart="${pfEscape(product.id)}"
      >
        Adicionar ao carrinho
      </button>

    </div>

    <p style="margin-top:15px;color:#85849e;font-size:9px;line-height:1.6">
      ${isSellerProduct
        ? "Produto publicado por um vendedor da plataforma. A entrega digital ainda depende da futura integração com o servidor."
        : "Produto inicial demonstrativo. Os arquivos dos pacotes de origem precisam ser organizados e disponibilizados antes da venda real."}
    </p>

  `;

  overlay.classList.add("open");

  overlay.setAttribute("aria-hidden", "false");

}


function pfCloseDetails() {

  const overlay = document.getElementById("pfDetailOverlay");

  if (!overlay) return;

  overlay.classList.remove("open");

  overlay.setAttribute("aria-hidden", "true");

  productBeingViewed = null;

}


// ==========================================================
// 28. CARRINHO DE COMPRAS
// ==========================================================

function pfSaveCart() {
  pfSetStorage("cart", cart);
}


function pfAddToCart(productId) {

  const product = pfFindProduct(productId);

  if (!product || product.status === "draft") {

    pfToast("Este produto não está disponível.", "error");

    return;
  }

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  pfSaveCart();

  pfUpdateCart();

  pfToast("Produto adicionado ao carrinho!");

  pfCloseDetails();

}


function pfRemoveFromCart(productId) {

  cart = cart.filter(item => item.id !== productId);

  pfSaveCart();

  pfUpdateCart();

}


function pfCartTotal() {

  return cart.reduce((total, item) => {

    const product = pfFindProduct(item.id);

    if (!product) return total;

    return total + product.price * item.quantity;

  }, 0);

}


function pfUpdateCart() {

  const countElement = document.getElementById("cartCount");

  const itemsElement = document.getElementById("cartItems");

  const emptyElement = document.getElementById("cartEmpty");

  const totalElement = document.getElementById("cartTotal");

  if (!itemsElement) return;

  cart = cart.filter(item => pfFindProduct(item.id));

  const totalCount = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  if (countElement) {
    countElement.textContent = totalCount;
  }

  itemsElement.innerHTML = "";

  if (emptyElement) {
    emptyElement.hidden = cart.length !== 0;
  }

  cart.forEach(item => {

    const product = pfFindProduct(item.id);

    if (!product) return;

    const element = document.createElement("div");

    element.className = "cart-item";

    element.innerHTML = `

      <div class="cart-item-info">

        <strong>${pfEscape(product.name)}</strong>

        <span>
          ${item.quantity} × ${pfMoney(product.price)}
        </span>

      </div>

      <div class="cart-item-actions">

        <strong>
          ${pfMoney(product.price * item.quantity)}
        </strong>

        <button
          class="remove-item"
          data-pf-remove-cart="${pfEscape(product.id)}"
        >
          ×
        </button>

      </div>

    `;

    itemsElement.appendChild(element);

  });

  if (totalElement) {
    totalElement.textContent = pfMoney(pfCartTotal());
  }

  pfSaveCart();

}


// ==========================================================
// 29. ABRIR E FECHAR CARRINHO
// ==========================================================

function pfOpenCart() {

  const modal = document.getElementById("cartModal");

  if (!modal) return;

  modal.classList.add("open");

  modal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

}


function pfCloseCart() {

  const modal = document.getElementById("cartModal");

  if (!modal) return;

  modal.classList.remove("open");

  modal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

}


// ==========================================================
// 30. PESQUISA E CATEGORIAS
// ==========================================================

function pfSetupCatalogFilters() {

  const search = document.getElementById("search");

  const categories = document.querySelectorAll(".category-card");

  const clear = document.getElementById("clearFilters");

  if (search) {

    search.addEventListener("input", event => {

      currentSearch = event.target.value.trim();

      pfRenderProducts();

    });

  }

  categories.forEach(button => {

    button.addEventListener("click", () => {

      currentCategory = button.dataset.category || "Todos";

      categories.forEach(item => {
        item.classList.remove("active");
      });

      button.classList.add("active");

      pfRenderProducts();

    });

  });

  if (clear) {

    clear.addEventListener("click", () => {

      currentCategory = "Todos";
      currentSearch = "";

      if (search) {
        search.value = "";
      }

      categories.forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.category === "Todos"
        );

      });

      pfRenderProducts();

    });

  }

}


// ==========================================================
// 31. MENU MOBILE
// ==========================================================

function pfSetupMobileMenu() {

  const button = document.getElementById("mobileMenuButton");

  const menu = document.getElementById("mobileMenu");

  if (!button || !menu) return;

  button.addEventListener("click", () => {

    menu.classList.toggle("open");

  });

  menu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      menu.classList.remove("open");

    });

  });

}


// ==========================================================
// 32. EVENTOS DA ÁREA DE TRABALHO
// ==========================================================

function pfSetupWorkspaceEvents() {

  const workspace = document.getElementById("pfWorkspace");

  if (!workspace) return;

  workspace.addEventListener("click", async event => {

    const tabButton = event.target.closest("[data-pf-tab]");

    if (tabButton) {

      sellerCurrentTab = tabButton.dataset.pfTab;

      pfRenderSellerPanel();

      return;
    }


    const actionButton = event.target.closest("[data-pf-action]");

    if (actionButton) {

      const action = actionButton.dataset.pfAction;

      if (action === "new") {
        sellerCurrentTab = "new";
        pfRenderSellerPanel();
      }

      if (action === "products") {
        sellerCurrentTab = "products";
        pfRenderSellerPanel();
      }

      if (action === "finance") {
        sellerCurrentTab = "finance";
        pfRenderSellerPanel();
      }

      if (action === "reset-seller") {
        await pfResetSeller();
      }

      if (action === "close-details") {
        pfCloseDetails();
      }

      return;
    }


    const editButton = event.target.closest("[data-pf-edit]");

    if (editButton) {
      pfEditProduct(editButton.dataset.pfEdit);
      return;
    }


    const deleteButton = event.target.closest("[data-pf-delete]");

    if (deleteButton) {
      await pfDeleteProduct(deleteButton.dataset.pfDelete);
      return;
    }


    const toggleButton = event.target.closest("[data-pf-toggle]");

    if (toggleButton) {
      pfToggleProduct(toggleButton.dataset.pfToggle);
      return;
    }


    const downloadButton = event.target.closest("[data-pf-download]");

    if (downloadButton) {
      await pfDownloadProductFile(downloadButton.dataset.pfDownload);
      return;
    }

  });


  workspace.addEventListener("submit", async event => {

    if (event.target.id === "pfSellerRegister") {

      pfHandleSellerRegister(event);

      return;
    }

    if (event.target.id === "pfProductForm") {

      await pfHandleProductSubmit(event);

      return;
    }

    if (event.target.id === "pfSettingsForm") {

      pfHandleSettings(event);

      return;
    }

  });


  workspace.addEventListener("input", event => {

    if (event.target.id === "pfSimulatorPrice") {
      pfUpdateSimulator();
    }

    if (event.target.id === "pfProductFile") {

      const file = event.target.files[0];

      const status = document.getElementById("pfFileStatus");

      if (file && status) {

        status.textContent =
          `Selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

      }

    }

  });

}


// ==========================================================
// 33. EVENTOS DO CATÁLOGO E CARRINHO
// ==========================================================

function pfSetupGlobalEvents() {

  const productGrid = document.getElementById("productGrid");

  const cartButton = document.getElementById("cartButton");

  const closeCartButton = document.getElementById("closeCart");

  const cartModal = document.getElementById("cartModal");

  const cartItems = document.getElementById("cartItems");

  const checkoutButton = document.getElementById("checkoutButton");

  const sellerSection = document.getElementById("vender");


  if (productGrid) {

    productGrid.addEventListener("click", event => {

      const addButton = event.target.closest("[data-pf-add-cart]");

      if (addButton) {

        pfAddToCart(addButton.dataset.pfAddCart);

        return;
      }

      const detailButton = event.target.closest("[data-pf-details]");

      if (detailButton) {

        pfShowDetails(detailButton.dataset.pfDetails);

      }

    });

  }


  document.addEventListener("click", event => {

    const addButton = event.target.closest("[data-pf-add-cart]");

    if (addButton && !productGrid?.contains(addButton)) {

      pfAddToCart(addButton.dataset.pfAddCart);

    }

    const removeButton = event.target.closest("[data-pf-remove-cart]");

    if (removeButton) {

      pfRemoveFromCart(removeButton.dataset.pfRemoveCart);

    }

    const detailButton = event.target.closest("[data-pf-details]");

    if (detailButton && !productGrid?.contains(detailButton)) {

      pfShowDetails(detailButton.dataset.pfDetails);

    }

  });


  if (cartButton) {
    cartButton.addEventListener("click", pfOpenCart);
  }

  if (closeCartButton) {
    closeCartButton.addEventListener("click", pfCloseCart);
  }

  if (cartModal) {

    cartModal.addEventListener("click", event => {

      if (event.target === cartModal) {
        pfCloseCart();
      }

    });

  }

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

      pfCloseCart();

      pfCloseDetails();

    }

  });


  if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

      if (cart.length === 0) {

        pfToast("Seu carrinho está vazio.", "error");

        return;
      }

      pfToast(
        "Pagamento ainda não integrado. Nenhuma cobrança foi realizada.",
        "error"
      );

    });

  }


  // Botão de vendedor da página principal.
  const sellerCTA = sellerSection?.querySelector("a.primary-button");

  if (sellerCTA) {

    sellerCTA.addEventListener("click", event => {

      event.preventDefault();

      document.getElementById("pfWorkspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  }

}


// ==========================================================
// 34. INICIALIZAÇÃO COMPLETA
// ==========================================================

async function pfInitialize() {

  console.log("Iniciando PixelForge...");

  pfInstallStyles();

  try {

    await pfOpenDatabase();

    console.log("Armazenamento local de arquivos disponível.");

  } catch (error) {

    console.warn(
      "Armazenamento de arquivos não disponível:",
      error
    );

  }

  pfCreateWorkspace();

  pfSetupCatalogFilters();

  pfSetupMobileMenu();

  pfSetupGlobalEvents();

  pfSetupWorkspaceEvents();

  pfRenderProducts();

  pfUpdateCart();

  console.log("PixelForge iniciado!");

  console.log(
    `${pfGetAllProducts().length} produtos disponíveis no catálogo.`
  );

}


// Inicia a aplicação quando a página estiver pronta.
if (document.readyState === "loading") {

  document.addEventListener("DOMContentLoaded", pfInitialize);

} else {

  pfInitialize();

}
