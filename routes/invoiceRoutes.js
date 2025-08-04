// routes/invoiceRoutes.js
const express = require("express");
const { downloadInvoice } = require("../controller/invoiceController");

const router = express.Router();

// Route: GET /invoice/:orderId
router.get("/invoice/:orderId", downloadInvoice);

module.exports = router;
