module.exports = async function generateInvoiceHTML(order) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Invoice #${order._id}</title>
   <style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    padding: 40px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header h1 {
    color: #81c408; 
    margin: 0;
    font-size: 28px;
  }

  .company-details {
    text-align: right;
    font-size: 14px;
    line-height: 1.6;
  }

  hr {
    margin: 20px 0;
    border: none;
    border-top: 2px solid #ddd;
  }

  .section-title {
    font-size: 18px;
    margin-top: 30px;
    margin-bottom: 10px;
    font-weight: bold;
  }

  .customer-details p {
    margin: 4px 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }

  th, td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: left;
    font-size: 14px;
  }

  th {
    background-color: #f4f4f4;
  }

  .total-line {
    text-align: right;
    font-size: 16px;
    font-weight: bold;
    margin-top: 20px;
  }
</style>

  </head>
  <body>
    <div class="header">
        <h1>PureFarmFoods</h1>
      <div class="company-details">
        1429 Netus Rd, Brooklyn, NY 48247<br />
        support@purefarmfoods.com<br />
        +1 (555) 123-4567
      </div>
    </div>

    <hr />

    <div class="section-title">Invoice Details</div>
    <div class="customer-details">
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(
        order.createdAt
      ).toLocaleDateString()}</p>
      <p><strong>Customer:</strong> ${order.shippingAddress.firstName} ${
    order.shippingAddress.lastName
  }</p>
      <p><strong>Address:</strong> ${order.shippingAddress.address}, ${
    order.shippingAddress.city
  }, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</p>
    </div>

    <div class="section-title">Order Summary</div>
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
          .map(function (item) {
            var name =
              item.product && item.product.name ? item.product.name : "N/A";
            var size = item.size || "-";
            var quantity = item.quantity;
            var price = item.price;
            var total = quantity * price;
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

    <p class="total-line">Total Amount: ₹${order.totalAmount.toFixed(2)}</p>
  </body>
  </html>
  `;
};
