const menu = document.getElementById('menu');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const closeModalBtn = document.getElementById('close-modal-btn');
const addressInput = document.getElementById('address');
const addressWarn = document.getElementById('address-warn');
const checkoutBtn = document.getElementById('checkout-btn');

const extrasModal = document.getElementById('extras-modal');
const closeExtrasModalBtn = document.getElementById('close-extras-modal');
const closeExtrasBtn = document.getElementById('close-extras-btn');
const confirmExtrasBtn = document.getElementById('confirm-extras-btn');
const extrasList = document.getElementById('extras-list');
const extrasItemName = document.getElementById('extras-item-name');
const extrasItemDesc = document.getElementById('extras-item-desc');
const extrasBasePrice = document.getElementById('extras-base-price');
const extrasAdditionalPrice = document.getElementById('extras-additional-price');
const extrasTotalPrice = document.getElementById('extras-total-price');

const availableExtras = [
    { id: 'bacon', name: 'Bacon', price: 3.50 },
    { id: 'queijo-extra', name: 'Queijo Extra', price: 2.00 },
    { id: 'ovo', name: 'Ovo', price: 1.50 },
    { id: 'alface', name: 'Alface', price: 1.00 },
    { id: 'tomate', name: 'Tomate', price: 1.00 },
    { id: 'molho-especial', name: 'Molho Especial', price: 1.50 }
];

let cart = [];
let currentItemForExtras = null;
let selectedExtras = [];

cartBtn.addEventListener('click', () => {
    renderCart();
    cartModal.style.display = 'flex';
});

cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal || e.target === closeModalBtn) {
        cartModal.style.display = 'none';
    }
});

menu.addEventListener('click', (e) => {
    const parentButton = e.target.closest('.add-to-cart-btn');
    if (parentButton) {
        const name = parentButton.getAttribute('data-name');
        const price = parseFloat(parentButton.getAttribute('data-price'));
        openExtrasModal(name, price);
    }
});

closeExtrasModalBtn.addEventListener('click', closeExtrasDrawer);
closeExtrasBtn.addEventListener('click', closeExtrasDrawer);

extrasModal.addEventListener('click', (e) => {
    if (e.target === extrasModal) {
        closeExtrasDrawer();
    }
});

confirmExtrasBtn.addEventListener('click', () => {
    if (currentItemForExtras) {
        addToCart(currentItemForExtras.name, currentItemForExtras.price, selectedExtras);
        closeExtrasDrawer();
        
        Toastify({
            text: `${currentItemForExtras.name} adicionado ao carrinho! ✓`,
            duration: 3000,
            style: { background: "#22c55e" }
        }).showToast();
    }
});

cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-btn')) {
        const index = e.target.getAttribute('data-index');
        removeItem(parseInt(index));
    }
});

checkoutBtn.addEventListener('click', finalizarPedido);

function openExtrasModal(itemName, itemPrice) {
    currentItemForExtras = { name: itemName, price: itemPrice };
    selectedExtras = [];
    
    extrasItemName.textContent = itemName;
    extrasItemDesc.textContent = `Preço base: R$ ${itemPrice.toFixed(2)}`;
    extrasBasePrice.textContent = `R$ ${itemPrice.toFixed(2)}`;
    
    extrasList.innerHTML = '';
    
    availableExtras.forEach(extra => {
        const label = document.createElement('label');
        label.className = 'extra-option';
        label.innerHTML = `
            <input type="checkbox" value="${extra.id}" data-price="${extra.price}">
            <span>${extra.name}</span>
            <span class="extra-price">+ R$ ${extra.price.toFixed(2)}</span>
        `;
        label.querySelector('input').addEventListener('change', updateExtrasPrice);
        extrasList.appendChild(label);
    });
    
    updateExtrasPrice();
    extrasModal.style.display = 'flex';
}

function closeExtrasDrawer() {
    extrasModal.style.display = 'none';
    selectedExtras = [];
    currentItemForExtras = null;
}

function updateExtrasPrice() {
    const checkboxes = extrasList.querySelectorAll('input[type="checkbox"]:checked');
    selectedExtras = [];
    let additionalPrice = 0;
    
    checkboxes.forEach(checkbox => {
        const extraData = availableExtras.find(e => e.id === checkbox.value);
        if (extraData) {
            selectedExtras.push(extraData);
            additionalPrice += extraData.price;
        }
    });
    
    const totalPrice = currentItemForExtras.price + additionalPrice;
    
    extrasAdditionalPrice.textContent = `R$ ${additionalPrice.toFixed(2)}`;
    extrasTotalPrice.textContent = `R$ ${totalPrice.toFixed(2)}`;
}

function addToCart(name, price, extras = []) {
    const extrasKey = extras.map(e => e.id).sort().join(',');
    const itemKey = `${name}_${extrasKey}`;
    const existingItem = cart.find(item => item.key === itemKey);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const totalPrice = price + extras.reduce((sum, extra) => sum + extra.price, 0);
        cart.push({ 
            key: itemKey,
            name, 
            price, 
            extras,
            totalPrice,
            quantity: 1 
        });
    }
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.totalPrice * item.quantity;
        total += itemTotal;

        const extrasText = item.extras.length > 0 
            ? `<br><small style="color: #666;">Extras: ${item.extras.map(e => e.name).join(', ')}</small>`
            : '';

        const itemDiv = document.createElement('div');
        itemDiv.style.marginBottom = "1rem";
        itemDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <p style="font-weight: bold; margin-bottom: 0.25rem;">${item.name}</p>
                    ${extrasText}
                    <p style="margin-top: 0.5rem;">Qtd: ${item.quantity} x R$ ${item.totalPrice.toFixed(2)}</p>
                    <p style="font-size: 0.9rem; color: #666; margin: 0;">Subtotal: R$ ${itemTotal.toFixed(2)}</p>
                </div>
                <button class="remove-btn" data-index="${index}" style="color: red; border:none; background:none; cursor:pointer; padding: 0.5rem; margin-left: 1rem;">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
            <hr style="margin: 0.5rem 0; border: 0.5px solid #eee;">
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    cartTotal.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    cartCount.innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
}

function removeItem(index) {
    if (cart[index]) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        renderCart();
    }
}

function checkRestaurantOpen() {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 22;
}

function finalizarPedido() {
    if (!checkRestaurantOpen()) {
        Toastify({ 
            text: "Ops! Estamos fechados no momento.", 
            style: { background: "#ef4444" },
            duration: 3000
        }).showToast();
        return;
    }

    if (cart.length === 0) {
        Toastify({ 
            text: "Seu carrinho está vazio!", 
            style: { background: "#f59e0b" },
            duration: 3000
        }).showToast();
        return;
    }

    if (addressInput.value.trim() === "") {
        addressWarn.classList.remove('hidden');
        addressInput.style.borderColor = "red";
        return;
    }

    addressWarn.classList.add('hidden');
    addressInput.style.borderColor = "";

    let totalGeral = 0;
    const itemsList = cart.map(item => {
        const subtotal = item.quantity * item.totalPrice;
        totalGeral += subtotal;
        const extrasText = item.extras.length > 0 
            ? ` [Extras: ${item.extras.map(e => `${e.name} +R$${e.price.toFixed(2)}`).join(', ')}]`
            : '';
        return `${item.name}${extrasText} | Qtd: ${item.quantity} | Unit: R$ ${item.totalPrice.toFixed(2)} | Subtotal: R$ ${subtotal.toFixed(2)}`;
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
}