// script.js
let currentCategory = null;
let selectedItem = null;
let currentOrders = [];
let menuItems = {
    asin: [
        { id: 1, name: "Nasi Goreng Spesial", price: 25000, description: "Nasi goreng dengan campuran seafood dan sayuran", image: "https://raw.githubusercontent.com/Khalis189/Warung-Mama-Uci/refs/heads/main/Cireng.jpg" },
        { id: 2, name: "Ayam Bakar Madu", price: 30000, description: "Ayam bakar dengan bumbu madu khas", image: "https://raw.githubusercontent.com/Khalis189/Warung-Mama-Uci/refs/heads/main/Cireng.jpg" },
        { id: 3, name: "Sate Lilit Bali", price: 35000, description: "Sate khas Bali dengan bumbu rempah", image: "https://raw.githubusercontent.com/Khalis189/Warung-Mama-Uci/refs/heads/main/Cireng.jpg" }
    ],
    manis: [
        { id: 4, name: "Pancake Berry", price: 20000, description: "Pancake dengan topping mixed berry", image: "https://raw.githubusercontent.com/Khalis189/Warung-Mama-Uci/refs/heads/main/Cireng.jpg" },
        { id: 5, name: "Waffle Maple", price: 25000, description: "Waffle renyah dengan sirup maple", image: "https://raw.githubusercontent.com/Khalis189/Warung-Mama-Uci/refs/heads/main/Cireng.jpg" },
        { id: 6, name: "Ice Cream Sundae", price: 30000, description: "Ice cream vanila dengan topping coklat dan kacang", image: "https://raw.githubusercontent.com/Khalis189/Warung-Mama-Uci/refs/heads/main/Cireng.jpg" }
    ]
};

function selectCategory(category) {
    currentCategory = category;
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'block';
    document.getElementById('menuTitle').textContent = `Menu ${category === 'asin' ? 'Makanan Asin' : 'Makanan Manis'}`;
    
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = '';
    
    menuItems[category].forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-image">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">Rp ${item.price.toLocaleString()}</p>
        `;
        menuItem.onclick = () => showOrderModal(item);
        menuContainer.appendChild(menuItem);
    });
}

function goBackToCategories() {
    document.getElementById('categorySelection').style.display = 'flex';
    document.getElementById('menuSection').style.display = 'none';
    currentCategory = null;
}

function showOrderModal(item) {
    selectedItem = item;
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalPrice').textContent = `Rp ${item.price.toLocaleString()}`;
    document.getElementById('quantity').value = 1;
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    selectedItem = null;
}

function adjustQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let newValue = parseInt(quantityInput.value) + change;
    if (newValue < 1) newValue = 1;
    quantityInput.value = newValue;
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const existingOrder = currentOrders.find(order => order.item.id === selectedItem.id);
    
    if (existingOrder) {
        existingOrder.quantity += quantity;
    } else {
        currentOrders.push({
            item: selectedItem,
            quantity: quantity
        });
    }
    
    updateTotal();
    closeModal();
}

function updateTotal() {
    let total = 0;
    currentOrders.forEach(order => {
        total += order.item.price * order.quantity;
    });
    
    document.getElementById('totalAmount').textContent = `Rp ${total.toLocaleString()}`;
    const totalContainer = document.getElementById('totalContainer');
    if (total > 0) {
        totalContainer.style.display = 'flex';
    } else {
        totalContainer.style.display = 'none';
    }
}

// Fungsi Checkout yang diperbarui
function checkout() {
    if (currentOrders.length === 0) {
        alert('Silahkan pilih menu terlebih dahulu!');
        return;
    }
    // Sembunyikan tampilan menu dan total, tampilkan checkout section
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('totalContainer').style.display = 'none';
    document.getElementById('checkoutSection').style.display = 'block';
    populateCheckout();
}

// Fungsi untuk mengisi ringkasan pesanan pada checkout section
function populateCheckout() {
    const summaryContainer = document.getElementById('orderSummary');
    summaryContainer.innerHTML = '';
    currentOrders.forEach(order => {
       const orderDiv = document.createElement('div');
       orderDiv.className = 'order-item';
       orderDiv.innerHTML = `
          <span>${order.item.name} x ${order.quantity}</span>
          <span>Rp ${(order.item.price * order.quantity).toLocaleString()}</span>
       `;
       summaryContainer.appendChild(orderDiv);
    });
    let total = currentOrders.reduce((acc, order) => acc + (order.item.price * order.quantity), 0);
    document.getElementById('checkoutTotal').textContent = `Rp ${total.toLocaleString()}`;
}

// Fungsi untuk kembali ke tampilan menu dari checkout
function goBackFromCheckout() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'block';
}

// Fungsi untuk mengonfirmasi pesanan (saat ini hanya simulasi)
function confirmCheckout() {
    // Simulasi konfirmasi pesanan, misalnya dengan menampilkan alert
    alert('Pesanan Anda telah dikonfirmasi! Terima kasih.');
    // Setelah konfirmasi, reset pesanan dan kembali ke tampilan kategori
    currentOrders = [];
    updateTotal();
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'flex';
}

// Close modal saat klik di luar area modal
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
}
