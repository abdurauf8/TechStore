/////////////////// Theme functions
const themeBtn = document.querySelector('.theme');
const logo = document.querySelector('#logo');

let currentTheme = localStorage.getItem('theme') || null;
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.classList.toggle('night');
    logo.setAttribute('src', '/src/assets/logo_nav.png');
}

themeBtn.addEventListener('click', () => {
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        currentTheme = 'light';
        themeBtn.classList.toggle('night');
        logo.setAttribute('src', '/src/assets/logo_nav_light.png');
    } else if (currentTheme === 'light' || !currentTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        currentTheme = 'dark';
        themeBtn.classList.toggle('night');
        logo.setAttribute('src', '/src/assets/logo_nav.png');
    }
});
///////////////////////// Notification
let timerN;
const notify = (message) => {
    clearTimeout(timerN);
    const alert = document.querySelector('.alert');
    alert.textContent = message;
    alert.classList.add('active');
    timerN = setTimeout(() => {
        alert.classList.remove('active');
    }, 2000);
};

///////////////// Calculate total amount
const checkedItemsCount = document.querySelector('#cart_count_aside');
const costPrice = document.querySelector('#cost_price');
const totalPrice = document.querySelector("#total_price")
const calculateTotal = () => {
    const currentCart = JSON.parse(
        localStorage.getItem('cart') || '{"cart":[]}'
    );
    
    let { count, price } = currentCart.cart.reduce((acc, c) => {
        if(c.checked){
            acc.count++;
            acc.price += c.price * c.quantity;
            return acc;
        };
        return acc;
    }, {count: 0, price: 0});

    checkedItemsCount.textContent = count;
    costPrice.textContent = `${price} $`
    totalPrice.textContent = `${price} $`;
};
calculateTotal();
////////////////////////////////
const products = document.querySelector('.products');
const emptyCart = () => {
    products.innerHTML = `<p class="empty_cart">There are no items in the shopping cart.</p>`;
    products.classList.add("empty");
};
////////////////////////////////

const renderCart = async () => {
    try {
        const res = await fetch('http://localhost:3300/products');
        if(!res.ok) {
            throw new Error("Serverdan ma'lumot olishda xatolik");
        };
        const data = res.json();

        const cartData = JSON.parse(localStorage.getItem("cart"));
        if (!cartData || cartData.cart.length < 1) {
            emptyCart();
            return;
        }

        let allChecked = true;
        for(let p of cartData.cart){
            if(!p.checked){
                allChecked = false;
            }
        }
        if(allChecked && cartData.cart.length > 0) {
            selectAll.checked = true;
        }

        document.querySelector('#cart_count').textContent = cartData.cart.length;

        products.innerHTML = "";
        const fragment = new DocumentFragment();
        cartData.cart.forEach(product => {
            // Creation
            const newProduct = document.createElement("div");

            const newInfoPart = document.createElement('div');
            const newCheckbox = document.createElement('input');
            const newImg = document.createElement('img');
            const newTextInfo = document.createElement('div');
            const newProductName = document.createElement('p');
            const newProductPrice = document.createElement('h3');
            const newInFavourites = document.createElement('p');

            const newControlsPart = document.createElement('div');
            const newProductCounterBox = document.createElement('div');
            const newMinusButton = document.createElement('button');
            const newCounterValue = document.createElement('p');
            const newPlusButton = document.createElement('button');
            const newSubtotalPriceBox = document.createElement('div');
            const newSubtotalPriceLabel = document.createElement('p');
            const newSubtotalPrice = document.createElement('h3');
            const newDeleteBtn = document.createElement('button');

            // Classlists
            newProduct.classList.add("product");
            newInfoPart.classList.add('info_part');
            newCheckbox.classList.add('checkbox');
            newTextInfo.classList.add('text_info');
            newProductName.classList.add('product_name');
            newProductPrice.classList.add('product_price');
            newInFavourites.classList.add('in_favourites');

            newControlsPart.classList.add('controls_part');
            newProductCounterBox.classList.add('product_counter');
            newSubtotalPriceBox.classList.add('subtotal_price');
            newSubtotalPrice.classList.add('sub_price');
            newDeleteBtn.classList.add('delete_btn');

            // Values
            newCheckbox.setAttribute("type", "checkbox");
            newCheckbox.checked = product.checked;
            newImg.setAttribute("src", `http://localhost:3300${product.img}`);
            newProductName.textContent = product.name;
            newProductPrice.textContent = `${product.price} $`;
            newInFavourites.innerHTML = `<i class="fa-regular fa-heart"></i>In favourites`;
            newMinusButton.textContent = "-";
            newCounterValue.textContent = product.quantity;
            newPlusButton.textContent = '+';
            newSubtotalPriceLabel.textContent = "Subtotal:"
            newSubtotalPrice.textContent = `${product.price * product.quantity} $`;
            newDeleteBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;

            // Append
            newTextInfo.append(newProductName, newProductPrice, newInFavourites);
            newInfoPart.append(newCheckbox, newImg, newTextInfo);
            newProductCounterBox.append(newMinusButton, newCounterValue, newPlusButton)            ;
            newSubtotalPriceBox.append(newSubtotalPriceLabel, newSubtotalPrice);
            newControlsPart.append(newProductCounterBox, newSubtotalPriceBox, newDeleteBtn);
            newProduct.append(newInfoPart, newControlsPart);
            fragment.append(newProduct);

            // Counter
            newProduct.addEventListener('click', (e) => {
                if(e.target.textContent === "-" && product.quantity > 1){
                    product.quantity--;
                    localStorage.setItem('cart', JSON.stringify(cartData));
                    newCounterValue.textContent = product.quantity;
                    newSubtotalPrice.textContent = `${product.price * product.quantity} $`;
                    calculateTotal();
                }else if(e.target.textContent === "+") {
                    product.quantity++;
                    localStorage.setItem('cart', JSON.stringify(cartData));
                    newCounterValue.textContent = product.quantity;
                    newSubtotalPrice.textContent = `${product.price * product.quantity} $`;
                    calculateTotal();
                }else if (e.target.closest(".delete_btn")) {
                    cartData.cart = cartData.cart.filter(p => p.id !== product.id);
                    localStorage.setItem("cart", JSON.stringify(cartData));
                    renderCart();
                    calculateTotal();
                }else if(e.target.tagName === "INPUT"){
                    if(e.target.checked){
                        product.checked = true;
                        localStorage.setItem('cart', JSON.stringify(cartData));
                        calculateTotal();

                        let allChecked = true;
                        for (let p of cartData.cart) {
                            if (!p.checked) {
                                allChecked = false;
                            }
                        }
                        if (allChecked && cartData.cart.length > 0) {
                            selectAll.checked = true;
                        }
                    }else {
                        product.checked = false;
                        localStorage.setItem('cart', JSON.stringify(cartData));
                        calculateTotal();
                        selectAll.checked = false;
                        
                    }
                }
            })

        });
        products.append(fragment);

    } catch (err) {
        console.log("Xatolik: ", err.message);
        notify("Xatolik sodir bo'ldi.");
    }
}
renderCart()

///////// Select All
const selectAllBox = document.querySelector('.select_all_box');
const selectAll = document.querySelector("#select_all");
selectAllBox.addEventListener("click", () => {
    if(selectAll.checked){
        const currentCart = JSON.parse(localStorage.getItem("cart"));
        currentCart.cart.forEach(p => p.checked = true);
        localStorage.setItem("cart", JSON.stringify(currentCart));
        renderCart();
        calculateTotal();
    }else {
        const currentCart = JSON.parse(localStorage.getItem('cart'));
        currentCart.cart.forEach((p) => (p.checked = false));
        localStorage.setItem('cart', JSON.stringify(currentCart));
        renderCart();
        calculateTotal();
    }
});

/////// Checkout
const checkoutBtn = document.querySelector('#checkout_btn');
checkoutBtn.addEventListener('click', () => {
    notify("Hozircha keingi sahifa mavjud emas.")
});