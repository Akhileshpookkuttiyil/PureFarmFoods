// util/generateInvoiceHTML.js
module.exports = async function generateInvoiceHTML(order) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Invoice ${order._id}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { text-align: center; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .total { text-align: right; font-weight: bold; }
    </style>
  </head>
  <body>
    <h1>Invoice</h1>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <p><strong>Customer:</strong> ${order.shippingAddress.firstName} ${
    order.shippingAddress.lastName
  }</p>
    <p><strong>Address:</strong> ${order.shippingAddress.address}, ${
    order.shippingAddress.city
  }, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</p>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Size</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.products
          .map((item) => {
            const name = item.product?.name || "N/A";
            const size = item.size || "-";
            const quantity = item.quantity;
            const price = item.price;
            const total = quantity * price;
            return `
              <tr>
                <td>${name}</td>
                <td>${size}</td>
                <td>${quantity}</td>
                <td>₹${price.toFixed(2)}</td>
                <td>₹${total.toFixed(2)}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>

    <p class="total">Total Amount: ₹${order.totalAmount.toFixed(2)}</p>
  </body>
  </html>
  `;
};
