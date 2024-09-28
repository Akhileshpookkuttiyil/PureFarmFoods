// Reusable function to add click event listener to elements
function addProductClickListener(containerSelector, itemSelector, urlPrefix) {
    const container = document.querySelector(containerSelector);
    if (container) {
        container.addEventListener('click', function(event) {
            const target = event.target.closest(itemSelector);
            if (event.target.closest('.btn')) {
                event.stopPropagation();
                return;
            }
            if (target) {
                const productId = target.getAttribute('data-product-id');
                if (productId) {
                    window.location.href = `${urlPrefix}/${productId}`;
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for vegetable items in the carousel
    addProductClickListener('.tab-content', '.fruite-item', '/product-detail');
    addProductClickListener('#vegetable-carousel', '.vesitable-item', '/product-detail');
    addProductClickListener('#product-list', '.fruite-item', '/product-detail');
});
