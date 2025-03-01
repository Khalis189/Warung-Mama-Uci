// Fungsi untuk memperbarui teks tombol pada modal berdasarkan kuantitas dan mode edit
function updateModalButtonText() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const btn = document.querySelector('.add-to-cart');
    if (editingOrderIndex !== null) {
        btn.textContent = (quantity === 0) ? 'Hapus Pesanan' : 'Ubah Jumlah Pesanan';
    } else {
        btn.textContent = 'Tambahkan ke Pesanan';
    }
}

// Tambahkan event listener agar setiap perubahan pada input kuantitas memicu update teks tombol
document.getElementById('quantity').addEventListener('input', updateModalButtonText);

// Deklarasi variabel global
let currentCategory = null;
let selectedItem = null;
let editingOrderIndex = null;  // Menandai index pesanan yang sedang diedit
let currentOrders = [];
let isCheckout = false; // Flag untuk mode checkout

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
    
    // Sembunyikan gambar dekorasi saat kategori dipilih
    document.getElementById('sideImage').style.display = 'none';
    
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
    
    // Tampilkan kembali gambar dekorasi saat kembali ke tampilan kategori
    document.getElementById('sideImage').style.display = 'block';
}

// Fungsi untuk menampilkan modal pesanan (untuk penambahan baru)
function showOrderModal(item) {
    editingOrderIndex = null;  // Reset mode edit
    selectedItem = item;
    document.getElementById('orderModal').style.display = 'flex';
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalPrice').textContent = `Rp ${item.price.toLocaleString()}`;
    document.getElementById('quantity').value = 1;
    updateModalButtonText();
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
    updateModalButtonText();
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
    updateModalButtonText();
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);
    
    // Jika quantity 0 dan dalam mode edit, hapus pesanan
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

function updateTotal() {
    let total = 0;
    currentOrders.forEach(order => {
        total += order.item.price * order.quantity;
    });
    document.getElementById('totalAmount').textContent = `Rp ${total.toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `Rp ${total.toLocaleString()}`;
    
    if (isCheckout) {
        // Saat checkout aktif, sembunyikan totalContainer
        document.getElementById('totalContainer').style.display = 'none';
    } else {
        // Jika total > 0 dan tidak dalam mode checkout, tampilkan totalContainer
        document.getElementById('totalContainer').style.display = (total > 0) ? 'flex' : 'none';
    }
    
    // Jika total menjadi 0 saat checkout aktif, kembalikan ke tampilan kategori
    if (total === 0 && isCheckout) {
        isCheckout = false;
        document.getElementById('checkoutSection').style.display = 'none';
        document.getElementById('categorySelection').style.display = 'flex';
        document.getElementById('menuSection').style.display = 'none';
        // Tampilkan kembali gambar di pojok kiri bawah
        document.getElementById('sideImage').style.display = 'block';
    }
}

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
    
    // Scroll checkout section ke tampilan atas dengan animasi smooth
    document.getElementById('checkoutSection').scrollIntoView({ behavior: 'smooth' });
}

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
               <span>Rp ${(order.item.price * order.quantity).toLocaleString()}</span>
           </div>
           <button class="edit-order-btn" onclick="editOrder(${index})">Edit</button>
       `;
       summaryContainer.appendChild(orderDiv);
    });
    updateTotal();
}

function goBackFromCheckout() {
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'block';
    isCheckout = false;
}

function confirmCheckout() {
    alert('Pesanan Anda telah dikonfirmasi! Terima kasih.');
    currentOrders = [];
    updateTotal();
    document.getElementById('checkoutSection').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'flex';
    // Tampilkan kembali gambar di pojok kiri bawah
    document.getElementById('sideImage').style.display = 'block';
    isCheckout = false;
}

window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
}


// Tampilkan form pembayaran saat tombol "Pilih Metode Pembayaran" diklik
function showPaymentForm() {
    document.getElementById("paymentMethodBtn").style.display = "none";
    document.getElementById("paymentForm").style.display = "block";
    // Scroll ke form pembayaran dengan animasi smooth
    document.getElementById("paymentForm").scrollIntoView({ behavior: "smooth" });
}


// Tampilkan atau sembunyikan field transfer berdasarkan pilihan metode pembayaran
function toggleTransferFields() {
    var paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    if(paymentMethod === "Transfer") {
        document.getElementById("transferFields").style.display = "block";
        // Pastikan file upload diperlukan jika metode Transfer
        document.getElementById("proofUpload").required = true;
    } else {
        document.getElementById("transferFields").style.display = "none";
        document.getElementById("proofUpload").required = false;
    }
}

// Tangani pengiriman form pembayaran
document.getElementById("paymentDetailsForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Kosongkan pesan error sebelumnya
    var errorContainer = document.getElementById("paymentErrors");
    errorContainer.innerHTML = "";
    
    var nameInput = document.getElementById("customerName").value.trim();
    var phoneInput = document.getElementById("customerWhatsapp").value.trim();
    var addressInput = document.getElementById("customerAddress").value.trim();
    var dateInput = document.getElementById("orderDate").value;
    
    var errors = [];
    
    // Validasi: Nama minimal 3 karakter
    if (nameInput.length < 3) {
        errors.push("Nama harus terdiri dari minimal 3 karakter.");
    }
    
    // Validasi: Nomor Whatsapp harus berupa angka dan minimal 10 digit
    var phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phoneInput)) {
        errors.push("Nomor Whatsapp harus berupa angka dan terdiri dari minimal 10 digit.");
    }
    
    // Validasi: Alamat minimal 10 karakter
    if (addressInput.length < 5) {
        errors.push("Alamat harus terdiri dari minimal 5 karakter.");
    }
    
    // Validasi: Tanggal pre-order harus diisi dan minimal besok
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
    
    // Jika ada error, tampilkan pesan error secara inline
    if (errors.length > 0) {
        errorContainer.innerHTML = errors.join("<br>");
        errorContainer.scrollIntoView({ behavior: "smooth" });
        return;
    }
    
    // Jika validasi berhasil, sembunyikan bagian checkout dan tampilkan pesan konfirmasi
    document.getElementById("checkoutSection").innerHTML = "<p style='color: green; text-align: center; font-size: 1.5em; margin: 20px 0;'>Pesanan Anda telah dikonfirmasi!</p>";
});


// Set min attribute untuk input orderDate agar tidak bisa memilih tanggal sebelum besok
document.addEventListener("DOMContentLoaded", function() {
    flatpickr("#orderDate", {
        altInput: true,                // Menampilkan input yang lebih user-friendly
        altFormat: "F j, Y",           // Format tampilan alternatif, misalnya "September 5, 2025"
        dateFormat: "Y-m-d",            // Format nilai yang disimpan
        minDate: "today",             // Bisa disesuaikan, misalnya "today" atau hitung tanggal besok
        onReady: function(selectedDates, dateStr, instance) {
            // Menonaktifkan input manual jika diinginkan:
            instance.altInput.setAttribute("readonly", "readonly");
        }
    });
});

