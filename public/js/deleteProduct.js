async function deleteProduct(productId) {
    const confirmation = confirm("Are you sure you want to delete this product?");
    if (!confirmation) return;

    try {
        const response = await fetch(`/seller/delete-product/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete product');
        }

        const result = await response.json();
        console.log('Product deleted:', result);

        // Remove the product card from the DOM
        const productCard = document.getElementById(`product-${productId}`);
        if (productCard) {
            productCard.remove();
        }
        alert('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    }
}
