// // Reusable function to fetch and update cart item count
// async function updateCartItemCount() {
//   let cartItemCount = 1;
//   try {
//     const response = await fetch("/cart/item-count");
//     if (response.ok) {
//       cartItemCount = await response.json();
//     }
//   } catch (error) {
//     console.warn("Failed to fetch cart item count:", error);
//   }

//   // Update the cart item count in the UI
//   const cartItemCountElement = document.querySelector(".cart-item-count");
//   if (cartItemCountElement) {
//     cartItemCountElement.textContent = cartItemCount;
//   }
// }

// // Initialize the cart count on page load
// document.addEventListener("DOMContentLoaded", updateCartItemCount);

// // Listen for custom "cartUpdated" events
// document.addEventListener("cartUpdated", updateCartItemCount);

// // Example of triggering "cartUpdated" when an item is added
// const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
// addToCartButtons.forEach((button) => {
//   button.addEventListener("click", async () => {
//     try {
//       // Add item to cart (replace with your actual API call)
//       const response = await fetch("/cart/add-item", {
//         method: "POST",
//         body: JSON.stringify({ itemId: button.dataset.itemId }),
//       });
//       if (response.ok) {
//         // Trigger the custom event to update the cart count
//         const cartUpdatedEvent = new Event("cartUpdated");
//         document.dispatchEvent(cartUpdatedEvent);
//       }
//     } catch (error) {
//       console.error("Failed to add item to cart:", error);
//     }
//   });
// });
