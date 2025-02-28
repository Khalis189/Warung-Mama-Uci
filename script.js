// Deklarasi variabel global
let currentCategory = null;
let selectedItem = null;
let editingOrderIndex = null;  // Variabel untuk menandai index pesanan yang sedang diedit
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

// Fungsi untuk memulai pemesanan dari landing page
function startOrdering() {
    const landing = document.getElementById('landingContainer');
    landing.classList.add('fade-out');
    setTimeout(() => {
        landing.style.display = 'none';
        const mainContent = document.getElementById('mainContent');
        mainContent.style.display = 'block';
        mainContent.classList.add('fade-in');
    }, 800); // Durasi animasi fadeOut (0.8 detik)
}

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

// Fungsi untuk menampilkan modal pemesanan (untuk penambahan pesanan baru)
function showOrderModal(item) {
    editingOrderIndex = null;  // Reset state edit
    selectedItem = item;
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalPrice').textContent = `Rp ${item.price.toLocaleString()}`;
    document.getElementById('quantity').value = 1;
}

// Fungsi untuk mengedit pesanan yang sudah ada
function editOrder(index) {
    editingOrderIndex = index;
    const order = currentOrders[index];
    selectedItem = order.item;
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('modalItemName').textContent = order.item.name;
    document.getElementById('modalPrice').textContent = `Rp ${order.item.price.toLocaleString()}`;
    document.getElementById('quantity').value = order.quantity;
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    selectedItem = null;
    editingOrderIndex = null;
}

function adjustQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let newValue = parseInt(quantityInput.value) + change;
    if (newValue < 0) newValue = 0;  // Izinkan nilai 0, tetapi tidak negatif
    quantityInput.value = newValue;
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Jika quantity 0 dan sedang dalam mode edit, hapus item dari keranjang
    if (quantity === 0) {
        if (editingOrderIndex !== null) {
            currentOrders.splice(editingOrderIndex, 1); // Hapus item dari array
        }
    } else {
        // Jika dalam mode edit, update pesanan yang ada
        if (editingOrderIndex !== null) {
            currentOrders[editingOrderIndex].quantity = quantity;
        } else {
            const existingOrder = currentOrders.find(order => order.item.id === selectedItem.id);
            if (existingOrder) {
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
    populateCheckout(); // Pastikan ringkasan pesanan ikut ter-update
    closeModal();
}

function updateTotal() {
    let total = 0;
    currentOrders.forEach(order => {
        total += order.item.price * order.quantity;
    });

    document.getElementById('totalAmount').textContent = `Rp ${total.toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `Rp ${total.toLocaleString()}`;

    // Tampilkan atau sembunyikan total container berdasarkan ada tidaknya pesanan
    const totalContainer = document.getElementById('totalContainer');
    totalContainer.style.display = (total > 0) ? 'flex' : 'none';
}

// Fungsi Checkout yang diperbarui
function checkout() {
    if (currentOrders.length === 0) {
        alert('Silahkan pilih menu terlebih dahulu!');
        return;
    }
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('totalContainer').style.display = 'none';
    document.getElementById('checkoutSection').style.display = 'block';
    populateCheckout();
}

// Fungsi untuk mengisi ringkasan pesanan pada checkout section
function populateCheckout() {
    const summaryContainer = document.getElementById('orderSummary');
    summaryContainer.innerHTML = ''; // Kosongkan sebelum mengisi ulang

    currentOrders.forEach((order, index) => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <span>${order.item.name} x ${order.quantity}</span>
            <span>Rp ${(order.item.price * order.quantity).toLocaleString()}</span>
            <button class="edit-order-btn" onclick="editOrder(${index})">Edit</button>
        `;
        summaryContainer.appendChild(orderDiv);
    });

    updateTotal(); // Pastikan total harga ikut diperbarui
}

function goBackFromCheckout() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'block';
    // Pesanan yang sudah ada tetap dipertahankan untuk diedit
}

function confirmCheckout() {
    alert('Pesanan Anda telah dikonfirmasi! Terima kasih.');
    currentOrders = [];
    updateTotal();
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'flex';
}

window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
}
