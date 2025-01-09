const express = require("express");
const userController = require("../controller/userController");
const nodemailerController = require("../controller/nodemailerController");
const upload = require("../util/multer");
const isAuthenticated = require("../middleware/authMiddleware");
const Router = express.Router();
require("dotenv").config();
const twilio = require("twilio");
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioController = require("../controller/twilioController"); // Import Twilio controller

const router = express.Router();
router.get("/", userController.getHome);
router.get("/login", userController.getLogin);
router.get("/signup", userController.getSignup);
router.get("/shop", userController.getShop);
router.get("/cart", isAuthenticated, userController.getCart);
router.get(
  "/cart/cartByUserId",
  isAuthenticated,
  userController.getCartDetails
);
router.get("/cart/item-count", isAuthenticated, userController.getCartCount);
router.get("/search-results", userController.searchResults);
router.get("/checkout", isAuthenticated, userController.getCheckOut);
router.post("/checkout-items", isAuthenticated, userController.checkoutItems);
router.post("/create-order", isAuthenticated, userController.createOrder);
router.post("/verify-payment", isAuthenticated, userController.verifyPayment);

// router.get('/get-orders',isAuthenticated,userController.getOrdersByUser)

router.get("/contact", userController.getContact);
router.get("/settings", isAuthenticated, userController.getSettings);
router.get("/logout", isAuthenticated, userController.getLogout);
router.delete(
  "/user/delete-Account",
  isAuthenticated,
  userController.deleteAccount
);

router.post("/users", userController.createUser);
router.post(
  "/user/change-password",
  isAuthenticated,
  userController.changePassword
);
router.post("/check-user", userController.checkUser);
router.post(
  "/user/update-profile",
  isAuthenticated,
  upload.single("profilePicture"),
  userController.updateUserDetails
);
router.post("/cart/add/", isAuthenticated, userController.addToCart);
router.post("/cart/update", isAuthenticated, userController.updateCart);
router.post("/cart/delete", isAuthenticated, userController.deleteCart);
router.post("/user/wishlist", isAuthenticated, userController.addToWishlist);
router.get("/user/wishlist", isAuthenticated, userController.getWishlist);

router.get("/users/get-categories", userController.getCategories);
router.get("/user/profile-data", userController.getUserProfile);
router.get("/category/:id/products", userController.getProductsByCategory);
router.get("/get-All-products/:id?", userController.getAllProducts);
router.get("/product-detail/:name", userController.getProductdetail);
router.get("/get-All-vegetables", userController.getVegetables);

router.get("/account-settings", userController.getAccountSettings);
router.get("/public-profile", userController.getPublicProfile);
router.get("/notifications", userController.getNotifications);
router.get("/manage-addresses", userController.getAddress);
router.get("/my-orders", userController.getOrders);
router.get("/track-order/:orderId",userController.trackOrder)
router.get("/fetch-orders", userController.fetchOrders);

// Twilio phone verification routes
router.post("/send-verification", twilioController.sendVerification); // Route to send verification code
router.post("/verify-code", twilioController.verifyCode); // Route to verify the code

// Route to send OTP
router.post("/user/send-otp", nodemailerController.sendOTP);

// Route to verify OTP
router.post("/user/verify-otp", nodemailerController.verifyOTP);

// Route to send email verification token
router.post(
  "/user/send-verification-email",
  nodemailerController.sendVerificationEmail
);

// Route to verify email from token
router.get("/user/verify-email/:token", nodemailerController.verifyEmailToken);

module.exports = router;
