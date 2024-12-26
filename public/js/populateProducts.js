async function populateProducts(url, containerId) {
    const productsContainer = document.getElementById(containerId);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');

        let { products, wishlist } = await response.json();

        // Filter products by approved status
        products = products.filter(product => product.status === 'approved');

        productsContainer.innerHTML = products.map(product => {
            const isInWishlist = wishlist.includes(product._id); // Check if the product is in the wishlist
            return `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="rounded position-relative fruite-item" data-product-id="${product.name}">
                    <div class="fruite-img">
                        <img src="images/${product.images[0]}" class="img-fluid w-100 rounded-top" alt="${product.name}">
                        <div class="position-absolute top-0 end-0 p-2">
                            <i class="fa fa-heart heart-icon ${isInWishlist ? 'filled' : ''}" 
                               style="font-size: 18px; cursor: pointer;" 
                               onclick="handleHeartClick(event, '${product._id}')"></i>
                        </div>  
                    </div>
                    <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">
                        ${product.category.name}
                    </div>
                    <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                        <div class="d-flex justify-content-center flex-lg-wrap">
                            <p class="text-dark fs-5 fw-bold mb-0">₹${product.price} / kg</p>
                            <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary add-to-cart-btn" data-product-id="${product._id}">
                                <i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await populateProducts('/get-All-products', 'all-products');
});
