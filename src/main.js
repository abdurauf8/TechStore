/////////////////// Cart counter
const cartCounter = document.querySelector('#cart_count');
const cartCount = () => {
    cartCounter.style.display = 'flex';
    const cartNow = JSON.parse(localStorage.getItem('cart'));
    if (cartNow && cartNow.cart.length > 0) {
        cartCounter.textContent = `${cartNow.cart.length}`;
        return;
    }
    cartCounter.style.display = 'none';
};
cartCount();
/////////////////// Theme functions
const themeBtn = document.querySelector('.theme');
const logo = document.querySelector('#logo');
const formTabLogo = document.getElementById('form_tab_logo');
const loginTabLogo = document.getElementById('login_tab_logo');

let currentTheme = localStorage.getItem('theme') || null;
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.classList.toggle('night');
    logo.setAttribute('src', '/src/assets/logo_nav.png');
    formTabLogo.setAttribute('src', '/src/assets/logo_login.png');
    loginTabLogo.setAttribute('src', '/src/assets/logo_login.png');
}

themeBtn.addEventListener('click', () => {
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        currentTheme = 'light';
        themeBtn.classList.toggle('night');
        logo.setAttribute('src', '/src/assets/logo_nav_light.png');
        formTabLogo.setAttribute('src', '/src/assets/logo_nav_light.png');
        loginTabLogo.setAttribute('src', '/src/assets/logo_nav_light.png');
    } else if (currentTheme === 'light' || !currentTheme) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        currentTheme = 'dark';
        themeBtn.classList.toggle('night');
        logo.setAttribute('src', '/src/assets/logo_nav.png');
        formTabLogo.setAttribute('src', '/src/assets/logo_login.png');
        loginTabLogo.setAttribute('src', '/src/assets/logo_login.png');
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
///////////////////////// Made page empty
const emptyPage = () => {
    products.innerHTML = `<p class="empty_page_p">Bunday mahsulot topilmadi.</p>`;
    products.classList.add('empty');
    pagenationUl.style.display = 'none';
};
/////////////////////////////////////
const products = document.querySelector('.products');
const categoriesUl = document.querySelector('.categories');
const pagenationUl = document.querySelector('.pagenation');

const formScreen = document.querySelector('.form_screen');
const postForm = document.querySelector('.form_tab');
const loginForm = document.querySelector('.login_tab');
const imgInput = document.getElementById('product_img_input');
const nameInput = document.getElementById('product_name_input');
const priceInput = document.getElementById('product_price_input');
const categoryInput = document.getElementById('product_category_input');
const previewImg = document.getElementById('previewImg');
const postBtn = document.getElementById('post_btn');
const loginLink = document.querySelector('#login_link');
const loginScreen = document.querySelector('.login_screen');
const rightNav = document.querySelector('.right_nav');
const cartLink = document.querySelector('.cart');

let editProductId = null;
let token = localStorage.getItem('token') || null;
let loggedIn = Boolean(token);

const addProductBtn = document.createElement('button');
const changeNav = () => {
    if (loggedIn) {
        if (cartLink) cartLink.style.display = 'none';
        loginLink.textContent = 'Log out';

        addProductBtn.style.display = 'flex';
        addProductBtn.textContent = 'Add Product';

        addProductBtn.classList.add('add_product_btn');
        rightNav.prepend(addProductBtn);

        addProductBtn.addEventListener('click', () => {
            formScreen.style.display = 'flex';
            imgInput.setAttribute('required', '');
            editProductId = null;
            imgInput.value = '';
            previewImg.src = '';
            nameInput.value = '';
            priceInput.value = '';
            categoryInput.value = '';
            postBtn.textContent = 'Add product';
            document.body.style.overflow = 'hidden';
        });
    } else {
        addProductBtn.style.display = 'none';
        cartLink.style.display = 'flex';
    }
};
changeNav();



//////// Fetch products
const fetchProducts = async function (role) {
    try {
        const res = await fetch('http://localhost:3300/products');
        if (!res.ok) {
            throw new Error("Serverdan ma'lumot olishda xatolik");
        }
        const data = await res.json();

        // Categories render
        const categories = data.reduce((acc, c) => {
            if (!acc.includes(c.category)) acc.push(c.category);
            return acc;
        }, []);

        categoriesUl.innerHTML = `<li id="all" class="active">All</li>`;
        const all = document.getElementById('all');
        let currentCategory = all;

        all.addEventListener('click', () => {
            pagenation(data);
            currentCategory.classList.remove('active');
            all.classList.add('active');
            currentCategory = all;
        });

        categories.forEach((categoryValue) => {
            const newCategory = document.createElement('li');
            newCategory.textContent =
                categoryValue[0].toUpperCase() + categoryValue.slice(1) + 's';
            categoriesUl.append(newCategory);

            newCategory.addEventListener('click', () => {
                currentCategory.classList.remove('active');
                newCategory.classList.add('active');
                currentCategory = newCategory;
                const categoriedData = data.filter(
                    (product) => product.category === categoryValue
                );
                pagenation(categoriedData);
            });
        });

        // Search rendering
        const searchInput = document.querySelector('#search_input');
        let timer;
        searchInput.addEventListener('input', () => {
            if (searchInput.value.length < 1 || !searchInput.value) {
                pagenation(data);
                currentCategory.classList.remove('active');
                all.classList.add('active');
                currentCategory = all;
                return;
            }

            clearTimeout(timer);
            timer = setTimeout(() => {
                const searchValue = searchInput.value.toLowerCase().trim();

                // If Name includes searchValue:
                const filtered = data.filter((product) =>
                    product.name.toLowerCase().includes(searchValue)
                );
                if (filtered.length < 1) {
                    // If categories includes searchValue:
                    if (categories.includes(searchValue)) {
                        const newCategoried = data.filter(
                            (p) => p.category === searchValue
                        );
                        pagenation(newCategoried);
                        return;
                    }

                    // If searchValue includes categories:
                    for (let c of categories) {
                        if (searchValue.includes(c)) {
                            const newCategoried = data.filter(
                                (p) => p.category === c
                            );
                            pagenation(newCategoried);
                            return;
                        }
                    }

                    // If searchValue include name:
                    const names = data.reduce((acc, c) => {
                        acc.push(c.name);
                        return acc;
                    }, []);

                    const byNames = [];
                    for (let name of names) {
                        if (searchValue.includes(name.toLowerCase().trim())) {
                            byNames.push(name);
                        }
                    }
                    console.log(byNames);
                    if (byNames.length > 0) {
                        const readyProducts = [];
                        for (let name of byNames) {
                            readyProducts.push(
                                data.find((p) => p.name === name)
                            );
                        }
                        pagenation(readyProducts);
                        return;
                    }

                    // Anyway not found:
                    emptyPage();
                    return;
                }

                pagenation(filtered);
            }, 1500);
        });

        // Rendering pagenaton
        function pagenation(readyData) {
            if (readyData.length === 0) {
                emptyPage();
                return;
            }
            pagenationUl.style.display = 'flex';

            const numberOfPages = Math.ceil(readyData.length / 12);
            const copiedReadyData = [...readyData];
            let separated = [];
            for (let i = 0; i < numberOfPages; i++) {
                separated.push([...copiedReadyData.slice(0, 12)]);
                copiedReadyData.splice(0, 12);
            }

            const newPrePage = document.createElement('li');
            const newNextPage = document.createElement('li');

            render(separated[0]);
            newPrePage.classList.add('disabled');
            if (separated.length === 1) newNextPage.classList.add('disabled');
            let currentPage = null;

            pagenationUl.innerHTML = '';
            separated.forEach((twelve) => {
                const newLi = document.createElement('li');
                newLi.textContent = separated.indexOf(twelve) + 1;
                pagenationUl.append(newLi);

                if (separated.indexOf(twelve) === 0) {
                    newLi.classList.add('active');
                    currentPage = newLi;
                }

                newLi.addEventListener('click', () => {
                    render(twelve);
                    if (currentPage) currentPage.classList.remove('active');
                    newLi.classList.add('active');
                    currentPage = newLi;
                    if (currentPage.textContent === '1') {
                        newPrePage.classList.add('disabled');
                    }
                    if (Number(currentPage.textContent) > 1) {
                        newPrePage.classList.remove('disabled');
                    }
                    if (Number(currentPage.textContent) === separated.length) {
                        newNextPage.classList.add('disabled');
                    }
                    if (Number(currentPage.textContent) < separated.length) {
                        newNextPage.classList.remove('disabled');
                    }
                });
            });

            newPrePage.innerHTML = `<i class="fa-solid fa-angle-left"></i>`;
            newNextPage.innerHTML = `<i class="fa-solid fa-angle-right"></i>`;

            pagenationUl.prepend(newPrePage);
            pagenationUl.append(newNextPage);

            newPrePage.addEventListener('click', () => {
                const currentIndex = Number(currentPage.textContent) - 1;
                if (currentIndex > 0) {
                    render(separated[currentIndex - 1]);
                    currentPage.classList.remove('active');
                    currentPage.previousElementSibling.classList.add('active');
                    currentPage = currentPage.previousElementSibling;
                }
                if (currentPage.textContent === '1') {
                    newPrePage.classList.add('disabled');
                }
                if (separated.length > 1 && currentIndex < separated.length) {
                    newNextPage.classList.remove('disabled');
                }
            });
            newNextPage.addEventListener('click', () => {
                const currentIndex = Number(currentPage.textContent) - 1;

                if (currentIndex < separated.length - 1) {
                    render(separated[currentIndex + 1]);
                    currentPage.classList.remove('active');
                    currentPage.nextElementSibling.classList.add('active');
                    currentPage = currentPage.nextElementSibling;
                }
                if (currentIndex === separated.length - 2) {
                    newNextPage.classList.add('disabled');
                }
                if (separated.length > 1 && currentIndex + 1 > 0) {
                    newPrePage.classList.remove('disabled');
                }
            });
        }
        pagenation(data);

        // Rendering products
        function render(array) {
            products.innerHTML = '';
            products.classList.remove('empty');
            const fragment = document.createDocumentFragment();
            array.forEach((product) => {
                const newProduct = document.createElement('div');
                const newImgPart = document.createElement('div');
                const newInfoPart = document.createElement('div');
                const newBtnsPart = document.createElement('div');
                const newAdminBtnsPart = document.createElement('div');
                if (role !== 'admin') newAdminBtnsPart.remove();
                const newImg = document.createElement('img');
                const newProductName = document.createElement('p');
                const newProductPrice = document.createElement('h3');

                const newAddFavouriteBtn = document.createElement('button');
                const newAddCartBtn = document.createElement('button');
                const newFavouriteI = document.createElement('i');
                const newCartI = document.createElement('i');

                newAddFavouriteBtn.classList.add('add_favourite');
                newAddCartBtn.classList.add('add_cart');
                newFavouriteI.classList.add('fa-regular', 'fa-heart');
                newCartI.classList.add('fa-solid', 'fa-cart-plus');

                newAddFavouriteBtn.textContent = 'Favourite';
                newAddCartBtn.textContent = 'Add to cart';

                newAddFavouriteBtn.prepend(newFavouriteI);
                newAddCartBtn.prepend(newCartI);
                newBtnsPart.append(newAddFavouriteBtn, newAddCartBtn);

                // Rendering add cart btns at current state
                const currentCart = JSON.parse(localStorage.getItem('cart'));
                if (currentCart) {
                    for (let p of currentCart.cart) {
                        if (product.id === p.id) {
                            newAddCartBtn.classList.add('added');
                            newAddCartBtn.innerHTML = `<i class="fa-solid fa-cart-arrow-down"></i> Added`;
                        }
                    }
                }
                // Rendering add favourite btns at current state
                const currentFavourites = JSON.parse(
                    localStorage.getItem('favourites')
                );
                if (currentFavourites) {
                    for (let p of currentFavourites.favourites) {
                        if (product.id === p.id) {
                            newAddFavouriteBtn.classList.add('added');
                            newAddFavouriteBtn.innerHTML = `<i class="fa-solid fa-heart"></i> Favourited`;
                        }
                    }
                }

                if (role === 'admin') {
                    const newEditBtn = document.createElement('button');
                    const newDeleteBtn = document.createElement('button');

                    newEditBtn.textContent = 'Edit product';
                    newDeleteBtn.textContent = 'Delete';

                    newEditBtn.classList.add('edit_btn');
                    newDeleteBtn.classList.add('delete_btn');

                    newAdminBtnsPart.classList.add('admin_buttons_part');
                    newAdminBtnsPart.append(newEditBtn, newDeleteBtn);
                }

                newProduct.classList.add('product');
                newImgPart.classList.add('img_part');
                newInfoPart.classList.add('info_part');
                newBtnsPart.classList.add('buttons_part');
                newProductName.classList.add('product_name');
                newProductPrice.classList.add('product_price');

                newImg.src = product.img;
                newImg.alt = 'Product image';

                newProductName.textContent = product.name;
                newProductPrice.textContent = product.price + ' $';

                newImgPart.append(newImg);
                newInfoPart.append(newProductName, newProductPrice);

                newProduct.append(
                    newImgPart,
                    newInfoPart,
                    newBtnsPart,
                    newAdminBtnsPart
                );
                fragment.append(newProduct);

                // Product buttons events
                newProduct.addEventListener('click', (e) => {
                    if (e.target.closest('.add_cart')) {
                        if (localStorage.getItem('cart') === null) {
                            let localCart = {
                                cart: [],
                            };
                            localCart.cart.push({
                                ...product,
                                quantity: 1,
                                checked: true,
                            });
                            localStorage.setItem(
                                'cart',
                                JSON.stringify(localCart)
                            );
                            notify("Savatga birinchi mahsulot qo'shildi.");
                            cartCount();
                            e.target
                                .closest('.add_cart')
                                .classList.add('added');
                            e.target.closest('.add_cart').innerHTML =
                                `<i class="fa-solid fa-cart-arrow-down"></i> Added`;
                        } else {
                            let localCart = JSON.parse(
                                localStorage.getItem('cart')
                            );
                            let contains = false;
                            for (let p of localCart.cart) {
                                if (p.id === product.id) contains = true;
                            }
                            if (!contains) {
                                localCart.cart.push({
                                    ...product,
                                    quantity: 1,
                                    checked: true,
                                });
                                localStorage.setItem(
                                    'cart',
                                    JSON.stringify(localCart)
                                );
                                notify("Savatga qo'shildi.");
                                cartCount();
                                e.target
                                    .closest('.add_cart')
                                    .classList.add('added');
                                e.target.closest('.add_cart').innerHTML =
                                    `<i class="fa-solid fa-cart-arrow-down"></i> Added`;
                            } else {
                                localCart.cart = localCart.cart.filter(
                                    (p) => p.id !== product.id
                                );
                                localStorage.setItem(
                                    'cart',
                                    JSON.stringify(localCart)
                                );
                                e.target
                                    .closest('.add_cart')
                                    .classList.remove('added');
                                e.target.closest('.add_cart').innerHTML =
                                    `<i class="fa-solid fa-cart-plus"></i> Add to cart`;
                                cartCount();
                                notify("Bu mahsulot savatdan o'chirildi.");
                                if (localCart.cart.length < 1)
                                    cartCounter.style.display = 'none';
                            }
                        }
                    } else if (e.target.closest('.add_favourite')) {
                        if (localStorage.getItem('favourites') === null) {
                            let localFavourites = {
                                favourites: [],
                            };
                            localFavourites.favourites.push(product);
                            localStorage.setItem(
                                'favourites',
                                JSON.stringify(localFavourites)
                            );
                            e.target
                                .closest('.add_favourite')
                                .classList.add('added');
                            e.target.closest('.add_favourite').innerHTML =
                                `<i class="fa-solid fa-heart"></i> Favourited`;
                            notify("Birinchi sevimli qo'shildi.");
                        } else {
                            let localFavourites = JSON.parse(
                                localStorage.getItem('favourites')
                            );
                            let contains = false;
                            for (let p of localFavourites.favourites) {
                                if (p.id === product.id) contains = true;
                            }
                            if (!contains) {
                                localFavourites.favourites.push(product);
                                localStorage.setItem(
                                    'favourites',
                                    JSON.stringify(localFavourites)
                                );
                                e.target
                                    .closest('.add_favourite')
                                    .classList.add('added');
                                e.target.closest('.add_favourite').innerHTML =
                                    `<i class="fa-solid fa-heart"></i> Favourited`;
                                notify("Sevimlilarga qo'shildi");
                            } else {
                                localFavourites.favourites =
                                    localFavourites.favourites.filter(
                                        (p) => p.id !== product.id
                                    );
                                localStorage.setItem(
                                    'favourites',
                                    JSON.stringify(localFavourites)
                                );
                                e.target
                                    .closest('.add_favourite')
                                    .classList.remove('added');
                                e.target.closest('.add_favourite').innerHTML =
                                    `<i class="fa-regular fa-heart"></i> Favourite`;
                                notify("Bu mahsulot sevimlilardan o'chirildi.");
                            }
                        }
                    } else if (e.target.closest('.edit_btn')) {
                        formScreen.style.display = 'flex';
                        document.body.style.overflow = 'hidden';
                        imgInput.removeAttribute('required');

                        imgInput.value = '';
                        previewImg.src = product.img;
                        nameInput.value = product.name;
                        priceInput.value = product.price;
                        categoryInput.value = product.category;

                        postBtn.textContent = 'Save Changes';

                        editProductId = product.id;
                    } else if (e.target.closest('.delete_btn')) {
                        async function deleteProduct() {
                            if (
                                confirm(
                                    `${product.name} ni rostdan ham o'chirmoqchimisiz?`
                                )
                            ) {
                                const res = await fetch(
                                    `http://localhost:3300/products/${product.id}`,
                                    {
                                        method: 'DELETE',
                                        headers: {
                                            "Content-Type": "application/json",
                                            'token': token
                                        },
                                    }
                                );
                                if (!res.ok)
                                    throw new Error(
                                        "O'chirish amalga oshmadi."
                                    );
                                notify("Mahsulot o'chirildi.");
                                fetchProducts('admin');
                            }
                        }
                        deleteProduct();
                    }
                });
            });
            products.append(fragment);
        }
    } catch (err) {
        console.log('Xatolik:', err.message);
        notify("Xatolik sodir bo'ldi");
    }
};
let arg = loggedIn ? 'admin' : 'user';
fetchProducts(arg);

//////////////////////// Login
const eye = document.querySelector('#eye_icon');
const loginInput = document.querySelector('#login_input');
const passwordInput = document.querySelector('#password_input');

loginLink.addEventListener('click', () => {
    if (!loggedIn) {
        loginScreen.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        loginLink.textContent = 'Log in';
        loggedIn = false;
        token = null;
        localStorage.removeItem('token');
        fetchProducts('user');
        changeNav();
    }
});
loginScreen.addEventListener('click', (e) => {
    if (
        e.target.className === 'login_screen' ||
        e.target.closest('.close_icon')
    ) {
        loginScreen.style.display = 'none';
        document.body.style.overflow = '';
    }
});
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        loginScreen.style.display = 'none';
        formScreen.style.display = 'none';
        document.body.style.overflow = '';
    }
});
eye.addEventListener('click', () => {
    if (!eye.classList.contains('fa-eye-slash')) {
        passwordInput.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:3300/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: loginInput.value.trim().toLowerCase(),
                password: passwordInput.value.trim(),
            }),
        });
        if (!res.ok) {
            throw new Error('Login muvaffaqiyatsiz.');
        }
        const data = await res.json();
        localStorage.setItem('token', data.token);
        token = data.token;
        loggedIn = true;
        loginLink.textContent = 'Log out';
        loginScreen.style.display = 'none';
        document.body.style.overflow = '';

        changeNav();
        fetchProducts('admin');
    } catch (err) {
        console.log('Xatolik: ', err.message);
        notify(err.message);
    }
});
////////////////////////// Form
formScreen.addEventListener('click', (e) => {
    if (
        e.target.className === 'form_screen' ||
        e.target.closest('.close_icon')
    ) {
        formScreen.style.display = 'none';
        document.body.style.overflow = '';
    }
});
////////////////////////// POST, PUT, DELETE
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        if (!editProductId) {
            const res = await fetch(`http://localhost:3300/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: token,
                },
                body: JSON.stringify({
                    name: nameInput.value,
                    category: categoryInput.value,
                    price: priceInput.value,
                    img: imgInput.value,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.holat);
            notify("Yangi mahsulot qo'shildi.");

            nameInput.value = '';
            priceInput.value = '';
            categoryInput.value = '';
            imgInput.value = '';
            formScreen.style.display = 'none';
            document.body.style.overflow = '';

            fetchProducts('admin');
        } else {
            const res = await fetch(
                `http://localhost:3300/products/${editProductId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        token: token,
                    },
                    body: JSON.stringify({
                        name: nameInput.value,
                        category: categoryInput.value,
                        price: priceInput.value,
                        img: imgInput.value,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(err.message);
            notify('Mahsulot yangilandi.');

            nameInput.value = '';
            priceInput.value = '';
            categoryInput.value = '';
            imgInput.value = '';

            editProductId = null;
            postBtn.textContent = 'Add product';
            document.body.style.overflow = '';

            formScreen.style.display = 'none';
            fetchProducts('admin');
        }
    } catch (err) {
        console.log('Xatolik:', err.message);
        notify(err.message);
    }
});

///////////// 
imgInput.addEventListener('input', () => {
    const isValid = /^https:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(
        imgInput.value
    );
    if (isValid) {
        previewImg.src = imgInput.value;
    }
});
