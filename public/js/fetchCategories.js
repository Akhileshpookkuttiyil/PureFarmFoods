document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch categories
        const categoriesResponse = await fetch('/users/get-categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const { categories, totalProducts } = await categoriesResponse.json();


        // Fetch cart item count if authenticated
        let cartItemCount = 0;
        try {
            const cartItemCountResponse = await fetch('/cart/item-count');
            if (cartItemCountResponse.ok) {
                cartItemCount = await cartItemCountResponse.json();
            }
        } catch (error) {
            console.warn('Failed to fetch cart item count:', error);
        }

        // Update cart item count in the UI
        const cartItemCountElement = document.querySelector('.cart-item-count');
        if (cartItemCountElement) {
            cartItemCountElement.textContent = cartItemCount;
        }

        // Select the carousel-inner element
        const carouselInner = document.querySelector('#carouselId .carousel-inner');

        // Create carousel items and set them in carousel-inner
        if (carouselInner) {
            carouselInner.innerHTML = categories.map((category, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''} rounded">
                    <img src="images/${category.image}" class="img-fluid w-100 h-100 rounded" alt="${category.name}">
                    <a href="#tab-${index + 1}" class="btn px-4 py-2 text-white rounded">${category.name}</a>
                </div>
            `).join('');
        }

        // Select the category tabs element
        const categoryTabs = document.getElementById('category-tabs');

        // Generate and insert HTML for category tabs, starting from index 1
        if (categoryTabs) {
            categoryTabs.innerHTML += categories.map((category, index) => `
                <li class="nav-item">
                    <a class="d-flex m-2 py-2 bg-light rounded-pill" data-bs-toggle="pill" href="#tab-${index + 2}">
                        <span class="text-dark" style="width: 130px;">${category.name}</span>
                    </a>
                </li>
            `).join('');
        }

        // Select the tab content container
        const tabContentContainer = document.querySelector('.tab-content');

        // Generate and insert HTML for category tab content
        if (tabContentContainer) {
            categories.forEach((category, index) => {
                const tabPane = document.createElement('div');
                tabPane.id = `tab-${index + 2}`;
                tabPane.classList.add('tab-pane', 'fade', 'show', 'p-0');
                tabPane.innerHTML = `<div class="row g-4" id="category-${category._id}"></div>`;
                tabContentContainer.appendChild(tabPane);
            });
        }

        for (const category of categories) {
            // Fetch the products and wishlist for the category
            const response = await fetch(`/category/${category._id}/products`);
            if (!response.ok) throw new Error(`Failed to fetch products for category ${category.name}`);
            
            // Parse the JSON response
            let { products, wishlist } = await response.json();
            
            products = products.filter(product => product.status === "approved");

            const tabContent = document.getElementById(`category-${category._id}`);
            if (tabContent) {
                tabContent.innerHTML = products.map(product => {
                    // Check if the product is in the wishlist
                    const isProductInWishlist = wishlist.includes(product._id);
        
                    return `
                        <div class="col-md-6 col-lg-4 col-xl-3">
                            <div class="rounded position-relative fruite-item" data-product-id="${product.name}">
                                <div class="fruite-img">
                                    <img src="images/${product.images[0]}" class="img-fluid w-100 rounded-top" alt="${product.name}">
                                    <div class="position-absolute top-0 end-0 p-2">
                                        <i class="fa fa-heart heart-icon ${isProductInWishlist ? 'filled' : ''}" style="font-size: 18px; cursor: pointer;" onclick="handleHeartClick(event,'${product._id}')"></i>
                                    </div>  
                                </div>
                                <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">
                                    ${product.category.name}
                                </div>
                                <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                                    <h4>${product.name}</h4>
                                    <p>${product.description}</p>
                                    <div class="d-flex justify-content-center flex-lg-wrap">
                                        <p class="text-dark fs-5 fw-bold mb-0">$${product.price} / kg</p>
                                        <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary add-to-cart-btn" data-product-id="${product._id}">
                                            <i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }        

        // Attach event listeners to the "Add to cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                const productId = event.target.getAttribute('data-product-id');
                const quantity = 1; // Default quantity; you can modify this if you have an input field for quantity

                try {
                    const response = await fetch('/cart/add/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId, quantity })
                    });

                    const textResponse = await response.text(); // Read response as text
                    if (response.ok) {
                        try {
                            const result = JSON.parse(textResponse); // Attempt to parse JSON
                            alert(result.message);

                            // Update cart item count after adding product to cart
                            const newCartItemCountResponse = await fetch('/cart/item-count');
                            if (newCartItemCountResponse.ok) {
                                const newCartItemCount = await newCartItemCountResponse.json();
                                const cartItemCountElement = document.querySelector('.cart-item-count');
                                if (cartItemCountElement) {
                                    cartItemCountElement.textContent = newCartItemCount;
                                }
                            } else {
                                console.error('Failed to fetch updated cart item count');
                            }
                        } catch (error) {
                            window.location.href = '/login';
                            console.error(error);
                        }
                    } else if (response.status === 401) {
                        // Redirect to login page if user is not authenticated
                        window.location.href = '/login';
                    } else {
                        console.error('Failed to add product to cart', response.status);
                        alert('Failed to add product to cart');
                    }
                } catch (err) {
                    console.error('Error adding product to cart:', err);
                }
            });
        });

    } catch (error) {
        console.error('Error:', error);
    }
});
