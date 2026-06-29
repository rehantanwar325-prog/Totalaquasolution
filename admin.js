// ============================
// ADMIN PANEL - CORE LOGIC
// ============================

// Default admin credentials (stored hashed in localStorage)
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin123";

// Default shop config
const defaultConfig = {
  shopName: "Total Aqua Solution",
  tagline: "Pure Water, Healthy Life",
  location: "Delhi NCR",
  whatsapp: "919876543210",
  phone: "+91 98765 43210",
  address: "Shop No. 12, Main Market, Sector 15, Near Metro Station, Delhi NCR",
  hours: "9:00 AM to 8:00 PM (All Days)"
};

// Default Products
const defaultProducts = [
  {
    id: 1, brand: "Kent", name: "Kent Grand Plus", type: "RO+UV+UF",
    price: 16500, originalPrice: 19500, badge: "Bestseller", image: "",
    specs: ["TDS Controller", "9L Storage Tank", "Save Water Technology", "1 Year Brand Warranty"]
  },
  {
    id: 2, brand: "Kent", name: "Kent Gold", type: "UF",
    price: 3200, originalPrice: 3800, badge: "Non-Electric", image: "",
    specs: ["Gravity Based Filtration", "20L Storage Tank", "Food-Grade Plastic", "6 Months Warranty"]
  },
  {
    id: 3, brand: "Aquaguard", name: "Aquaguard Ritz", type: "RO+UV",
    price: 18999, originalPrice: 22000, badge: "Copper Active", image: "",
    specs: ["Alkaline Boost Tech", "Active Copper Filter", "Advanced MTDS Controller", "1 Year Warranty"]
  },
  {
    id: 4, brand: "Aquaguard", name: "Aquaguard Aura", type: "UV+UF",
    price: 8499, originalPrice: 10500, badge: "Eco-Friendly", image: "",
    specs: ["Active Copper Filter", "Dual Filtration", "Compact Design", "1 Year Brand Warranty"]
  },
  {
    id: 5, brand: "Pureit", name: "Pureit Copper+ Eco", type: "RO+UV+UF",
    price: 21500, originalPrice: 24999, badge: "Premium", image: "",
    specs: ["Copper Charge Technology", "Eco Recovery (Save Water)", "8L Storage Tank", "1 Year Warranty"]
  },
  {
    id: 6, brand: "Pureit", name: "Pureit Classic", type: "RO",
    price: 11999, originalPrice: 14500, badge: "Value for Money", image: "",
    specs: ["TDS Modulator", "6L Storage Tank", "Advanced 6-Stage Tech", "1 Year Brand Warranty"]
  },
  {
    id: 7, brand: "Livpure", name: "Livpure Bolt", type: "RO+UV",
    price: 10499, originalPrice: 12999, badge: "Smart RO", image: "",
    specs: ["7-Stage Filtration", "7L Storage Tank", "Mineralizer", "1 Year Brand Warranty"]
  },
  {
    id: 8, brand: "Livpure", name: "Livpure Glitz", type: "RO+UV+UF",
    price: 12499, originalPrice: 14999, badge: "Hot Seller", image: "",
    specs: ["Alkaline Filter", "Smart LED Indicators", "8L Storage Tank", "1 Year Warranty"]
  }
];

// State
let shopConfig = { ...defaultConfig };
let productsList = [];
let currentImageBase64 = "";
let deletingProductId = null;

// ============================
// SECURITY: Simple hash function
// ============================
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function initCredentials() {
  const storedCreds = localStorage.getItem("total_aqua_admin_creds");
  if (!storedCreds) {
    const hashedPass = await hashString(DEFAULT_PASSWORD);
    const creds = { username: DEFAULT_USERNAME, passwordHash: hashedPass };
    localStorage.setItem("total_aqua_admin_creds", JSON.stringify(creds));
  }
}

async function verifyLogin(username, password) {
  const storedCreds = localStorage.getItem("total_aqua_admin_creds");
  if (!storedCreds) return false;
  const creds = JSON.parse(storedCreds);
  const inputHash = await hashString(password);
  return creds.username === username && creds.passwordHash === inputHash;
}

// ============================
// DOM ELEMENTS
// ============================
const loginScreen = document.getElementById("loginScreen");
const adminWrapper = document.getElementById("adminWrapper");
const loginForm = document.getElementById("loginForm");
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const loginError = document.getElementById("loginError");
const togglePass = document.getElementById("togglePass");
const logoutBtn = document.getElementById("logoutBtn");

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");

// Dashboard
const statTotalProducts = document.getElementById("statTotalProducts");
const statTotalBrands = document.getElementById("statTotalBrands");
const statAvgPrice = document.getElementById("statAvgPrice");
const statWhatsApp = document.getElementById("statWhatsApp");
const recentProductsList = document.getElementById("recentProductsList");

// Products page
const productsAdminGrid = document.getElementById("productsAdminGrid");
const addProductBtn = document.getElementById("addProductBtn");
const productSearch = document.getElementById("productSearch");

// Product modal
const productModal = document.getElementById("productModal");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");
const productForm = document.getElementById("productForm");
const modalTitle = document.getElementById("modalTitle");
const prodEditId = document.getElementById("prodEditId");
const prodBrand = document.getElementById("prodBrand");
const prodBrandCustom = document.getElementById("prodBrandCustom");
const prodName = document.getElementById("prodName");
const prodType = document.getElementById("prodType");
const prodBadge = document.getElementById("prodBadge");
const prodPrice = document.getElementById("prodPrice");
const prodOriginalPrice = document.getElementById("prodOriginalPrice");
const prodSpecs = document.getElementById("prodSpecs");
const prodImage = document.getElementById("prodImage");
const imagePreview = document.getElementById("imagePreview");
const uploadImageBtn = document.getElementById("uploadImageBtn");
const removeImageBtn = document.getElementById("removeImageBtn");

// Delete modal
const deleteModal = document.getElementById("deleteModal");
const deleteProductName = document.getElementById("deleteProductName");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

// Settings
const settingsForm = document.getElementById("settingsForm");
const sShopName = document.getElementById("sShopName");
const sLocation = document.getElementById("sLocation");
const sTagline = document.getElementById("sTagline");
const sWhatsApp = document.getElementById("sWhatsApp");
const sPhone = document.getElementById("sPhone");
const sAddress = document.getElementById("sAddress");
const sHours = document.getElementById("sHours");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

// Security
const securityForm = document.getElementById("securityForm");
const secUser = document.getElementById("secUser");
const secCurrentPass = document.getElementById("secCurrentPass");
const secNewPass = document.getElementById("secNewPass");
const secConfirmPass = document.getElementById("secConfirmPass");
const secError = document.getElementById("secError");
const secErrorMsg = document.getElementById("secErrorMsg");

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", async () => {
  await initCredentials();

  // Check session
  if (sessionStorage.getItem("aqua_admin_session") === "active") {
    showDashboard();
  }

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = await verifyLogin(loginUser.value.trim(), loginPass.value);
    if (ok) {
      sessionStorage.setItem("aqua_admin_session", "active");
      loginError.style.display = "none";
      showDashboard();
    } else {
      loginError.style.display = "flex";
      loginPass.value = "";
      loginPass.focus();
    }
  });

  // Toggle password visibility
  togglePass.addEventListener("click", () => {
    const type = loginPass.type === "password" ? "text" : "password";
    loginPass.type = type;
    togglePass.querySelector("i").className = type === "password" ? "fa-solid fa-eye" : "fa-solid fa-eye-slash";
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("aqua_admin_session");
    adminWrapper.style.display = "none";
    loginScreen.style.display = "flex";
    loginUser.value = "";
    loginPass.value = "";
  });

  // Sidebar toggle (mobile)
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });

  // Navigation
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const page = item.getAttribute("data-page");
      switchPage(page);
      sidebar.classList.remove("open");
    });
  });

  // Add product button
  addProductBtn.addEventListener("click", () => openProductModal());

  // Modal close
  closeModal.addEventListener("click", closeProductModal);
  cancelModal.addEventListener("click", closeProductModal);

  // Product form save
  productForm.addEventListener("submit", handleProductSave);

  // Brand dropdown toggle custom input
  prodBrand.addEventListener("change", () => {
    if (prodBrand.value === "Other") {
      prodBrandCustom.style.display = "block";
      prodBrandCustom.required = true;
      prodBrandCustom.focus();
    } else {
      prodBrandCustom.style.display = "none";
      prodBrandCustom.required = false;
      prodBrandCustom.value = "";
    }
  });

  // Image upload
  uploadImageBtn.addEventListener("click", () => prodImage.click());
  imagePreview.addEventListener("click", () => prodImage.click());
  prodImage.addEventListener("change", handleImageUpload);
  removeImageBtn.addEventListener("click", removeImage);

  // Delete modal
  cancelDelete.addEventListener("click", () => { deleteModal.classList.remove("open"); deletingProductId = null; });
  confirmDelete.addEventListener("click", handleDeleteConfirm);

  // Product search
  productSearch.addEventListener("input", renderProductsGrid);

  // Settings form
  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveShopSettings();
  });

  resetSettingsBtn.addEventListener("click", () => {
    if (confirm("Kya aap shop settings ko default par reset karna chahte hain?")) {
      shopConfig = { ...defaultConfig };
      populateSettings();
      saveConfigLS();
      showToast("Settings reset to defaults!");
    }
  });

  // Security form
  securityForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSecuritySave();
  });
});

// ============================
// NAVIGATION
// ============================
const pageTitles = {
  dashboard: { title: "Dashboard", subtitle: "Welcome back, Admin!" },
  products: { title: "Product Management", subtitle: "Add, edit or delete purifiers from your catalog" },
  settings: { title: "Shop Settings", subtitle: "Manage your website information" },
  security: { title: "Security", subtitle: "Update admin login credentials" }
};

function switchPage(pageName) {
  // Update nav
  navItems.forEach(n => n.classList.remove("active"));
  document.querySelector(`.nav-item[data-page="${pageName}"]`)?.classList.add("active");

  // Update pages
  pages.forEach(p => p.classList.remove("active"));
  const targetPage = document.getElementById("page" + pageName.charAt(0).toUpperCase() + pageName.slice(1));
  if (targetPage) targetPage.classList.add("active");

  // Update topbar
  const info = pageTitles[pageName] || {};
  pageTitle.textContent = info.title || "Dashboard";
  pageSubtitle.textContent = info.subtitle || "";
}

// Make switchPage globally accessible for inline handlers
window.switchPage = switchPage;

// ============================
// SHOW DASHBOARD
// ============================
function showDashboard() {
  loginScreen.style.display = "none";
  adminWrapper.style.display = "flex";
  loadShopConfig();
  loadProducts();
  updateDashboardStats();
  renderProductsGrid();
  renderRecentProducts();
}

// ============================
// SHOP CONFIG
// ============================
function loadShopConfig() {
  const saved = localStorage.getItem("total_aqua_config");
  if (saved) {
    try {
      shopConfig = JSON.parse(saved);
      if (shopConfig.shopName === "AquaPure Solutions") {
        shopConfig.shopName = "Total Aqua Solution";
        saveConfigLS();
      }
    } catch (e) {
      shopConfig = { ...defaultConfig };
    }
  }
  populateSettings();
}

function populateSettings() {
  sShopName.value = shopConfig.shopName;
  sLocation.value = shopConfig.location;
  sTagline.value = shopConfig.tagline;
  sWhatsApp.value = shopConfig.whatsapp;
  sPhone.value = shopConfig.phone;
  sAddress.value = shopConfig.address;
  sHours.value = shopConfig.hours;
}

function sanitizeWhatsApp(num) {
  let cleaned = num.replace(/\D/g, "");
  if (cleaned.length === 10) cleaned = "91" + cleaned;
  return cleaned;
}

function saveShopSettings() {
  shopConfig.shopName = sShopName.value.trim();
  shopConfig.location = sLocation.value.trim();
  shopConfig.tagline = sTagline.value.trim();
  shopConfig.whatsapp = sanitizeWhatsApp(sWhatsApp.value.trim());
  shopConfig.phone = sPhone.value.trim();
  shopConfig.address = sAddress.value.trim();
  shopConfig.hours = sHours.value.trim();

  saveConfigLS();
  updateDashboardStats();
  showToast("Shop settings saved successfully!");
}

function saveConfigLS() {
  localStorage.setItem("total_aqua_config", JSON.stringify(shopConfig));
}

// ============================
// PRODUCTS
// ============================
function loadProducts() {
  const saved = localStorage.getItem("total_aqua_products");
  if (saved) {
    try { productsList = JSON.parse(saved); } catch (e) { productsList = [...defaultProducts]; }
  } else {
    productsList = [...defaultProducts];
    saveProductsLS();
  }
}

function saveProductsLS() {
  localStorage.setItem("total_aqua_products", JSON.stringify(productsList));
}

function renderProductsGrid() {
  const searchTerm = productSearch.value.toLowerCase().trim();
  let filtered = productsList;
  if (searchTerm) {
    filtered = productsList.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm) ||
      p.type.toLowerCase().includes(searchTerm)
    );
  }

  productsAdminGrid.innerHTML = "";

  if (filtered.length === 0) {
    productsAdminGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>Koi product nahi mila</h3>
        <p>${searchTerm ? "Search change karein ya naya product add karein" : "Abhi tak koi product add nahi hua"}</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "prod-admin-card";

    const specsHTML = p.specs.slice(0, 4).map(s => `<span class="pac-spec-tag">${s}</span>`).join("");

    const imageHTML = (p.image && p.image.trim() !== "" && p.image !== "null" && p.image !== "undefined")
      ? `<img src="${p.image}" alt="${p.name}">`
      : `<i class="fa-solid fa-glass-water pac-placeholder"></i>`;

    card.innerHTML = `
      <div class="pac-image">
        ${imageHTML}
        ${p.badge ? `<div class="pac-badge">${p.badge}</div>` : ""}
      </div>
      <div class="pac-body">
        <div class="pac-brand">${p.brand}</div>
        <div class="pac-name">${p.name}</div>
        <span class="pac-type">${p.type}</span>
        <div class="pac-specs">${specsHTML}</div>
        <div class="pac-price-row">
          <div class="pac-prices">
            <span class="pac-offer-price">₹${p.price.toLocaleString()}</span>
            <span class="pac-original-price">₹${p.originalPrice.toLocaleString()}</span>
          </div>
          <div class="pac-actions">
            <button class="pac-btn pac-btn-edit" title="Edit" data-id="${p.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="pac-btn pac-btn-delete" title="Delete" data-id="${p.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    productsAdminGrid.appendChild(card);
  });

  // Attach events
  productsAdminGrid.querySelectorAll(".pac-btn-edit").forEach(btn => {
    btn.addEventListener("click", () => openProductModal(parseInt(btn.dataset.id)));
  });

  productsAdminGrid.querySelectorAll(".pac-btn-delete").forEach(btn => {
    btn.addEventListener("click", () => openDeleteModal(parseInt(btn.dataset.id)));
  });
}

function renderRecentProducts() {
  recentProductsList.innerHTML = "";
  const recent = productsList.slice(-5).reverse();
  if (recent.length === 0) {
    recentProductsList.innerHTML = `<div style="padding: 20px; text-align:center; color: var(--text-muted);">No products yet</div>`;
    return;
  }
  recent.forEach(p => {
    const imgHTML = (p.image && p.image.trim() !== "" && p.image !== "null" && p.image !== "undefined")
      ? `<img src="${p.image}" alt="${p.name}">`
      : `<i class="fa-solid fa-glass-water"></i>`;

    const el = document.createElement("div");
    el.className = "recent-product-item";
    el.innerHTML = `
      <div class="recent-prod-img">${imgHTML}</div>
      <div class="recent-prod-info">
        <h4>${p.name}</h4>
        <span>${p.brand} · ${p.type}</span>
      </div>
      <div class="recent-prod-price">₹${p.price.toLocaleString()}</div>
    `;
    recentProductsList.appendChild(el);
  });
}

function updateDashboardStats() {
  statTotalProducts.textContent = productsList.length;
  const brands = [...new Set(productsList.map(p => p.brand))];
  statTotalBrands.textContent = brands.length;
  if (productsList.length > 0) {
    const avg = Math.round(productsList.reduce((s, p) => s + p.price, 0) / productsList.length);
    statAvgPrice.textContent = "₹" + avg.toLocaleString();
  } else {
    statAvgPrice.textContent = "₹0";
  }
  statWhatsApp.textContent = shopConfig.whatsapp ? shopConfig.whatsapp : "Not Set";
}

// ============================
// PRODUCT MODAL (Add/Edit)
// ============================
function openProductModal(id = null) {
  productForm.reset();
  currentImageBase64 = "";
  resetImagePreview();
  prodBrandCustom.style.display = "none";
  prodBrandCustom.required = false;
  prodBrandCustom.value = "";

  if (id) {
    const product = productsList.find(p => p.id === id);
    if (!product) return;

    modalTitle.innerHTML = `<i class="fa-solid fa-pencil"></i> Edit Product`;
    prodEditId.value = product.id;
    
    // Check if brand is one of standard options
    const standardBrands = ["Kent", "Aquaguard", "Pureit", "Livpure", "Havells", "Blue Star"];
    if (standardBrands.includes(product.brand)) {
      prodBrand.value = product.brand;
    } else {
      prodBrand.value = "Other";
      prodBrandCustom.style.display = "block";
      prodBrandCustom.required = true;
      prodBrandCustom.value = product.brand;
    }

    prodName.value = product.name;
    prodType.value = product.type;
    prodBadge.value = product.badge || "";
    prodPrice.value = product.price;
    prodOriginalPrice.value = product.originalPrice;
    prodSpecs.value = product.specs.join(", ");

    if (product.image && product.image.trim() !== "" && product.image !== "null" && product.image !== "undefined") {
      currentImageBase64 = product.image;
      showImagePreview(product.image);
    }
  } else {
    modalTitle.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Add New Product`;
    prodEditId.value = "";
  }

  productModal.classList.add("open");
}

function closeProductModal() {
  productModal.classList.remove("open");
  productForm.reset();
  currentImageBase64 = "";
  resetImagePreview();
  prodBrandCustom.style.display = "none";
  prodBrandCustom.required = false;
  prodBrandCustom.value = "";
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      // Create canvas for compression
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Max dimensions (e.g. 800px)
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Compress to JPEG with 0.7 quality
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      
      currentImageBase64 = compressedDataUrl;
      showImagePreview(currentImageBase64);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  imagePreview.innerHTML = `<img src="${src}" alt="Preview">`;
  removeImageBtn.style.display = "inline-flex";
}

function resetImagePreview() {
  imagePreview.innerHTML = `
    <i class="fa-solid fa-cloud-arrow-up"></i>
    <span>Product Image Upload Karein</span>
    <small>JPG, PNG, WEBP (Max 2MB)</small>
  `;
  removeImageBtn.style.display = "none";
}

function removeImage() {
  currentImageBase64 = "";
  prodImage.value = "";
  resetImagePreview();
}

function handleProductSave(e) {
  e.preventDefault();

  const id = prodEditId.value;
  let brand = prodBrand.value;
  if (brand === "Other") {
    brand = prodBrandCustom.value.trim() || "Other";
  }
  const name = prodName.value.trim();
  const type = prodType.value;
  const badge = prodBadge.value;
  const price = parseInt(prodPrice.value);
  const originalPrice = parseInt(prodOriginalPrice.value);
  const specsArray = prodSpecs.value.split(",").map(s => s.trim()).filter(s => s.length > 0);

  const productData = {
    brand, name, type, price, originalPrice, badge,
    image: currentImageBase64,
    specs: specsArray
  };

  if (id) {
    const idx = productsList.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      productsList[idx] = { ...productsList[idx], ...productData };
    }
    showToast(`"${name}" successfully update ho gaya!`);
  } else {
    const nextId = productsList.length > 0 ? Math.max(...productsList.map(p => p.id)) + 1 : 1;
    productsList.push({ id: nextId, ...productData });
    showToast(`"${name}" successfully add ho gaya!`);
  }

  saveProductsLS();
  renderProductsGrid();
  renderRecentProducts();
  updateDashboardStats();
  closeProductModal();
}

// ============================
// DELETE MODAL
// ============================
function openDeleteModal(id) {
  const product = productsList.find(p => p.id === id);
  if (!product) return;
  deletingProductId = id;
  deleteProductName.textContent = `"${product.name}" ko permanently delete karna chahte hain?`;
  deleteModal.classList.add("open");
}

function handleDeleteConfirm() {
  if (deletingProductId === null) return;
  const prod = productsList.find(p => p.id === deletingProductId);
  productsList = productsList.filter(p => p.id !== deletingProductId);
  saveProductsLS();
  renderProductsGrid();
  renderRecentProducts();
  updateDashboardStats();
  deleteModal.classList.remove("open");
  showToast(`"${prod?.name || "Product"}" delete ho gaya!`);
  deletingProductId = null;
}

// ============================
// SECURITY
// ============================
async function handleSecuritySave() {
  secError.style.display = "none";

  const newUser = secUser.value.trim();
  const currentPass = secCurrentPass.value;
  const newPass = secNewPass.value;
  const confirmPass = secConfirmPass.value;

  // Verify current password
  const storedCreds = JSON.parse(localStorage.getItem("total_aqua_admin_creds"));
  const currentHash = await hashString(currentPass);
  if (currentHash !== storedCreds.passwordHash) {
    secErrorMsg.textContent = "Current password galat hai!";
    secError.style.display = "flex";
    return;
  }

  if (newPass !== confirmPass) {
    secErrorMsg.textContent = "New password aur Confirm password match nahi karte!";
    secError.style.display = "flex";
    return;
  }

  if (newPass.length < 6) {
    secErrorMsg.textContent = "Password kam se kam 6 characters ka hona chahiye!";
    secError.style.display = "flex";
    return;
  }

  // Save new credentials
  const newHash = await hashString(newPass);
  const newCreds = { username: newUser, passwordHash: newHash };
  localStorage.setItem("total_aqua_admin_creds", JSON.stringify(newCreds));

  securityForm.reset();
  showToast("Login credentials updated! Naye credentials se login karein.");
}

// ============================
// TOAST
// ============================
function showToast(msg) {
  toastMsg.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3500);
}
