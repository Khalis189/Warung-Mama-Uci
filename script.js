// Global variables for menu and orders
let currentCategory = null;
let selectedItem = null;
let editingOrderIndex = null;  // Index pesanan yang sedang diedit
let currentOrders = [];
let isCheckout = false; // Flag untuk mode checkout
window.dataLoaded = false;

// Global menuItems (akan diisi via JSONP)
window.menuItems = {
  asin: [],
  manis: []
};

// ------------------------------
// JSONP Loader & Callback
// ------------------------------

// Fungsi untuk memuat data menu menggunakan JSONP
function loadMenuData(callbackName) {
  const script = document.createElement('script');
  // Ganti URL berikut dengan URL web app Apps Script Anda
  script.src = 'https://script.google.com/macros/s/AKfycbwynf9kFk-A_xXguptGR0SXeqtLa4MfD-YjA8LzAWPT4PoRboYLv384RpUssBPUzqle/exec?callback=' + callbackName;
  document.body.appendChild(script);
}

// Callback yang akan dipanggil oleh respons JSONP dari Apps Script
function handleMenuData(data) {
    console.log("JSONP data fetched:", data);
    if (!data || data.length < 2) {
      console.error("Data tidak lengkap atau tidak ditemukan.");
      return;
    }
    let headers = data[0];
    let items = data.slice(1).map(row => {
      let item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
    window.menuItems.asin = items.filter(item => String(item.category).toLowerCase() === 'asin');
    window.menuItems.manis = items.filter(item => String(item.category).toLowerCase() === 'manis');
    window.dataLoaded = true;  // Tandai data sudah dimuat
    console.log("Menu asin:", window.menuItems.asin);
    console.log("Menu manis:", window.menuItems.manis);
  }
  

// Panggil loadMenuData() dengan callback 'handleMenuData'
loadMenuData('handleMenuData');

// ------------------------------
// Fungsi UI & Pemesanan
// ------------------------------

// Mulai proses pemesanan (dari landing page)
function startOrdering() {
  const landing = document.getElementById('landingContainer');
  landing.classList.add('fade-out');
  setTimeout(() => {
    landing.style.display = 'none';
    const mainContent = document.getElementById('mainContent');
    mainContent.style.display = 'block';
    mainContent.classList.add('fade-in');
  }, 800);
}

// Tampilkan menu berdasarkan kategori yang dipilih
function selectCategory(category) {
    if (!window.dataLoaded) {
      alert("Data menu belum selesai dimuat. Silakan tunggu beberapa saat.");
      return;
    }
    currentCategory = category;
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'block';
    document.getElementById('menuTitle').textContent = `Menu ${category === 'asin' ? 'Makanan Asin' : 'Makanan Manis'}`;
    document.getElementById('sideImage').style.display = 'none';
    
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = '';
    
    if (!window.menuItems[category] || window.menuItems[category].length === 0) {
      console.warn(`Tidak ada item untuk kategori ${category}`);
    }
    
    window.menuItems[category].forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'menu-item';
      if (Number(item.stock) <= 0) {
        menuItem.classList.add('out-of-stock');
      } else {
        menuItem.onclick = () => showOrderModal(item);
      }
      menuItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-image">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <p class="price">Rp ${Number(item.price).toLocaleString()}</p>
        <p class="stock">Stok: ${item.stock}</p>
      `;
      menuContainer.appendChild(menuItem);
    });
  }
  

// Kembali ke tampilan kategori
function goBackToCategories() {
  document.getElementById('categorySelection').style.display = 'flex';
  document.getElementById('menuSection').style.display = 'none';
  currentCategory = null;
  document.getElementById('sideImage').style.display = 'block';
}

// Tampilkan modal pesanan untuk item yang dipilih
function showOrderModal(item) {
  editingOrderIndex = null;
  selectedItem = item;
  document.getElementById('orderModal').style.display = 'flex';
  document.getElementById('modalItemName').textContent = item.name;
  document.getElementById('modalPrice').textContent = `Rp ${Number(item.price).toLocaleString()}`;
  document.getElementById('quantity').value = 1;
  document.getElementById('modalStock').textContent = "Stok: " + item.stock;
  if (Number(item.stock) <= 0) {
    document.querySelector('.add-to-cart').disabled = true;
    document.querySelector('.add-to-cart').textContent = "Stok Habis";
  } else {
    document.querySelector('.add-to-cart').disabled = false;
    updateModalButtonText();
  }
}

// Edit pesanan yang sudah ada
function editOrder(index) {
  editingOrderIndex = index;
  const order = currentOrders[index];
  selectedItem = order.item;
  document.getElementById('orderModal').style.display = 'flex';
  document.getElementById('modalItemName').textContent = order.item.name;
  document.getElementById('modalPrice').textContent = `Rp ${Number(order.item.price).toLocaleString()}`;
  document.getElementById('quantity').value = order.quantity;
  document.getElementById('modalStock').textContent = "Stok: " + order.item.stock;
  updateModalButtonText();
}

// Tutup modal pesanan
function closeModal() {
  document.getElementById('orderModal').style.display = 'none';
  selectedItem = null;
  editingOrderIndex = null;
}

// Ubah jumlah pesanan (quantity) di modal
function adjustQuantity(change) {
  const quantityInput = document.getElementById('quantity');
  let newValue = parseInt(quantityInput.value) + change;
  if (selectedItem && newValue > Number(selectedItem.stock)) {
    newValue = Number(selectedItem.stock);
  }
  if (newValue < 0) newValue = 0;
  quantityInput.value = newValue;
  updateModalButtonText();
}

// Perbarui teks tombol pada modal berdasarkan kuantitas dan mode edit
function updateModalButtonText() {
  const quantity = parseInt(document.getElementById('quantity').value);
  const btn = document.querySelector('.add-to-cart');
  if (editingOrderIndex !== null) {
    btn.textContent = (quantity === 0) ? 'Hapus Pesanan' : 'Ubah Jumlah Pesanan';
  } else {
    btn.textContent = 'Tambahkan ke Pesanan';
  }
}

document.getElementById('quantity').addEventListener('input', updateModalButtonText);

// Tambahkan atau ubah pesanan dalam keranjang
function addToCart() {
  const quantity = parseInt(document.getElementById('quantity').value);
  if (quantity > Number(selectedItem.stock)) {
    alert("Jumlah pesanan melebihi stok yang tersedia!");
    return;
  }
  if (quantity === 0) {
    if (editingOrderIndex !== null) {
      currentOrders.splice(editingOrderIndex, 1);
    }
  } else {
    if (editingOrderIndex !== null) {
      currentOrders[editingOrderIndex].quantity = quantity;
    } else {
      const existingOrder = currentOrders.find(order => order.item.id === selectedItem.id);
      if (existingOrder) {
        if (existingOrder.quantity + quantity > Number(selectedItem.stock)) {
          alert("Total pesanan melebihi stok yang tersedia!");
          return;
        }
        existingOrder.quantity += quantity;
      } else {
        currentOrders.push({
          item: selectedItem,
          quantity: quantity
        });
      }
    }
  }
  editingOrderIndex = null;
  updateTotal();
  populateCheckout();
  closeModal();
}

// Perbarui total harga pesanan
function updateTotal() {
  let total = 0;
  currentOrders.forEach(order => {
    total += Number(order.item.price) * order.quantity;
  });
  document.getElementById('totalAmount').textContent = `Rp ${total.toLocaleString()}`;
  document.getElementById('checkoutTotal').textContent = `Rp ${total.toLocaleString()}`;
  if (isCheckout) {
    document.getElementById('totalContainer').style.display = 'none';
  } else {
    document.getElementById('totalContainer').style.display = (total > 0) ? 'flex' : 'none';
  }
  if (total === 0 && isCheckout) {
    isCheckout = false;
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'flex';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('sideImage').style.display = 'block';
  }
}

// Lanjutkan ke checkout
function checkout() {
  if (currentOrders.length === 0) {
    alert('Silahkan pilih menu terlebih dahulu!');
    return;
  }
  isCheckout = true;
  document.getElementById('totalContainer').style.display = 'none';
  document.getElementById('menuSection').style.display = 'none';
  document.getElementById('checkoutSection').style.display = 'block';
  populateCheckout();
  document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });
}

// Tampilkan ringkasan pesanan di checkout
function populateCheckout() {
  const summaryContainer = document.getElementById('orderSummary');
  summaryContainer.innerHTML = '';
  currentOrders.forEach((order, index) => {
    const orderDiv = document.createElement('div');
    orderDiv.className = 'order-item';
    orderDiv.innerHTML = `
      <div class="order-info">
        <span class="order-name">${order.item.name} x ${order.quantity}</span>
      </div>
      <div class="order-price">
        <span>Rp ${(Number(order.item.price) * order.quantity).toLocaleString()}</span>
      </div>
      <button class="edit-order-btn" onclick="editOrder(${index})">Edit</button>
    `;
    summaryContainer.appendChild(orderDiv);
  });
  updateTotal();
}

// Kembali dari checkout ke tampilan menu
function goBackFromCheckout() {
  document.getElementById('checkoutSection').style.display = 'none';
  document.getElementById('menuSection').style.display = 'block';
  isCheckout = false;
}

// ------------------------------
// Fungsi Payment Form
// ------------------------------

function showPaymentForm() {
  document.getElementById("paymentMethodBtn").style.display = "none";
  document.getElementById("paymentForm").style.display = "block";
  document.getElementById("paymentForm").scrollIntoView({ behavior: "smooth" });
}

function toggleTransferFields() {
  var paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  if (paymentMethod === "Transfer") {
    document.getElementById("transferFields").style.display = "block";
    document.getElementById("proofUpload").required = true;
  } else {
    document.getElementById("transferFields").style.display = "none";
    document.getElementById("proofUpload").required = false;
  }
}

document.getElementById("paymentDetailsForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  var errorContainer = document.getElementById("paymentErrors");
  errorContainer.innerHTML = "";
  
  var nameInput = document.getElementById("customerName").value.trim();
  var phoneInput = document.getElementById("customerWhatsapp").value.trim();
  var addressInput = document.getElementById("customerAddress").value.trim();
  var dateInput = document.getElementById("orderDate").value;
  
  var errors = [];
  
  if (nameInput.length < 3) {
    errors.push("Nama harus terdiri dari minimal 3 karakter.");
  }
  
  var phoneRegex = /^\d{10,}$/;
  if (!phoneRegex.test(phoneInput)) {
    errors.push("Nomor Whatsapp harus berupa angka dan terdiri dari minimal 10 digit.");
  }
  
  if (addressInput.length < 5) {
    errors.push("Alamat harus terdiri dari minimal 5 karakter.");
  }
  
  if (!dateInput) {
    errors.push("Silakan isi tanggal untuk pre-order.");
  } else {
    var selectedDate = new Date(dateInput);
    var today = new Date();
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    if (selectedDate < tomorrow) {
      errors.push("Tanggal minimal untuk pre-order adalah besok.");
    }
  }
  
  if (errors.length > 0) {
    errorContainer.innerHTML = errors.join("<br>");
    errorContainer.scrollIntoView({ behavior: "smooth" });
    return;
  }
  
  const orderData = {
    customerName: nameInput,
    customerWhatsapp: phoneInput,
    customerAddress: addressInput,
    orderDate: dateInput,
    orders: currentOrders
  };
  
  submitOrder(orderData);
});

function submitOrder(orderData) {
  // Ganti URL di bawah dengan URL web app Apps Script Anda
  fetch('https://script.google.com/macros/s/AKfycbwuPRPdNCAtwO05Cih5LPWn5ZUADaYANOtxOwxXABf7_3sY24Jv1Ap0eZYvnjqzmOML/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => response.json())
  .then(result => {
    if (result.status === 'success') {
      alert('Pesanan Anda telah dikonfirmasi!');
      currentOrders = [];
      updateTotal();
      document.getElementById("checkoutSection").style.display = 'none';
      document.getElementById("categorySelection").style.display = 'flex';
      document.getElementById("sideImage").style.display = 'block';
      isCheckout = false;
    } else {
      alert('Gagal mengirim pesanan: ' + result.message);
    }
  })
  .catch(err => console.error('Error submitting order:', err));
}

window.onclick = function(event) {
  const modal = document.getElementById('orderModal');
  if (event.target === modal) {
    closeModal();
  }
}

document.addEventListener("DOMContentLoaded", function() {
  flatpickr("#orderDate", {
    altInput: true,
    altFormat: "F j, Y",
    dateFormat: "Y-m-d",
    minDate: "today",
    onReady: function(selectedDates, dateStr, instance) {
      instance.altInput.setAttribute("readonly", "readonly");
    }
  });
  // Data menu sudah dimuat melalui JSONP (loadMenuData dipanggil di awal)
});
