const menu = document.getElementById('menu');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const addressInput = document.getElementById('address');
const addressWarn = document.getElementById('address-warn');
const checkoutBtn = document.getElementById('checkout-btn');
const cartBtn = document.getElementById('cart-btn');
const closeModalBtn = document.getElementById('close-modal-btn');

let cart = [];

// Abrir modal
cartBtn.addEventListener('click', () => {
    renderCart();
    cartModal.style.display = 'flex';
});

// Fechar modal
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal || e.target === closeModalBtn) {
        cartModal.style.display = 'none';
    }
});

// Adicionar ao carrinho
menu.addEventListener('click', (e) => {
    let parentButton = e.target.closest('.add-to-cart-btn');
    if (parentButton) {
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price'));
        addToCart(name, price);
    }
});

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    renderCart();
}

// Renderizar carrinho e atualizar totais
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const div = document.createElement('div');
        div.style.marginBottom = "1rem";
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <p style="font-weight: bold;">${item.name}</p>
                    <p>Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)}</p>
                    <p style="font-size: 0.9rem; color: #666;">Subtotal: R$ ${itemTotal.toFixed(2)}</p>
                </div>
                <button class="remove-btn" data-name="${item.name}" style="color: red; border:none; background:none; cursor:pointer;">Remover</button>
            </div>
            <hr style="margin-top: 0.5rem; border: 0.5px solid #eee;">
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotal.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    cartCount.innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
}

// Remover item
cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const name = e.target.getAttribute('data-name');
        removeItem(name);
    }
});

function removeItem(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        renderCart();
    }
}

// Validação de horário
function checkRestaurantOpen() {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 22; // Aberto das 8h às 22h
}

// Finalizar Pedido
checkoutBtn.addEventListener('click', () => {
    if (!checkRestaurantOpen()) {
        Toastify({ text: "Ops! Estamos fechados no momento.", style: { background: "#ef4444" } }).showToast();
        return;
    }

    if (cart.length === 0) return;
    if (addressInput.value === "") {
        addressWarn.classList.remove('hidden');
        addressInput.style.borderColor = "red";
        return;
    }

    // Gerar mensagem detalhada para WhatsApp
    let totalGeral = 0;
    const itemsList = cart.map(item => {
        const subtotal = item.quantity * item.price;
        totalGeral += subtotal;
        return `${item.name} | Qtd: ${item.quantity} | Unit: R$ ${item.price.toFixed(2)} | Subtotal: R$ ${subtotal.toFixed(2)}`;
    }).join('\n');

    const message = encodeURIComponent(
        `*NOVO PEDIDO DEV BURGER*\n` +
        `--------------------------\n` +
        `${itemsList}\n` +
        `--------------------------\n` +
        `*TOTAL DO PEDIDO: R$ ${totalGeral.toFixed(2)}*\n\n` +
        `*Endereço:* ${addressInput.value}`
    );

    window.open(`https://wa.me/5583994143557?text=${message}`, '_blank');
    cart = [];
    renderCart();
    cartModal.style.display = 'none';
    addressInput.value = "";
});