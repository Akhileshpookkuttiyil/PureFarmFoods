// util/generateInvoicePDF.js
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const generateInvoiceHTML = require("./generateInvoiceHTML");

const generateInvoicePDF = async (order, filename) => {
  const invoiceDir = path.resolve("./invoices");
  const filePath = path.join(invoiceDir, filename);

  // Generate the HTML content
  const htmlContent = await generateInvoiceHTML(order);

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: "new", // 'new' mode in recent Puppeteer versions
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // good for server environments
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  // Generate PDF
  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return filePath;
};

module.exports = generateInvoicePDF;
