// controllers/invoiceController.js
const fs = require("fs");
const path = require("path");
const generateInvoicePDF = require("../util/generateInvoicePDF");
const Order = require("../model/Order");

exports.downloadInvoice = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId)
      .populate("user", "email")
      .populate("products.product", "name");

    if (!order) return res.status(404).send("Order not found.");

    const invoiceDir = path.resolve("./invoices");
    if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

    const filename = `invoice-${order._id}.pdf`;
    const pdfPath = await generateInvoicePDF(order, filename);

    res.download(pdfPath, filename, (err) => {
      if (err) {
        console.error("Download failed:", err);
        res.status(500).send("Invoice download failed.");
      }
    });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).send("Server error while generating invoice.");
  }
};
