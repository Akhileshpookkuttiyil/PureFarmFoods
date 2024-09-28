
document.addEventListener('DOMContentLoaded', () => {
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

    // Update cart item count when the page loads
    // updateCartItemCount();
});

async function updateCartItemCount() {
    try {
        const response = await fetch('/cart/item-count');
        const itemCount = await response.json();
        const cartItemCountElement = document.querySelector('.cart-item-count');
        cartItemCountElement.textContent = itemCount;
    } catch (error) {
        console.error('Error fetching cart item count:', error);
    }
}
