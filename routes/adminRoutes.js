const express = require("express");
const adminController = require("../controller/adminController");
const upload = require("../util/multer");
const router = express.Router();
const isAuthenticated = require("../middleware/adminAuth");

router.get("/admin", isAuthenticated, adminController.getHome);
router.get("/add-category", isAuthenticated, adminController.addCategory);
router.post(
  "/insert-category",
  isAuthenticated,
  upload.single("categoryImage"),
  adminController.postCategory
);
router.post(
  "/insert-Subcategory",
  isAuthenticated,
  upload.single("subcategoryImage"),
  adminController.postSubcategory
);
router.get("/add-subCategory", isAuthenticated, adminController.addSubcategory);
router.get(
  "/categoriesPage",
  isAuthenticated,
  adminController.getCategoriesPage
);
router.get("/categories", isAuthenticated, adminController.getCategories);
router.get("/view-Users", isAuthenticated, adminController.viewUsers);
router.get("/view-Sellers", isAuthenticated, adminController.viewSellers);


router.get("/admin/view-Orders", isAuthenticated, adminController.viewOrders);
router.get('/admin/orders/:orderId', isAuthenticated, adminController.getOrderDetails);
// Get tracking history
router.get("/admin/orders/:orderId/tracking", isAuthenticated, adminController.getOrderTracking);
// Update tracking information
router.post("/admin/orders/:orderId/tracking", isAuthenticated, adminController.updateOrderTracking);


router.get("/view-Products", isAuthenticated, adminController.viewProducts);
router.get(
  "/admin/adminProfile",
  isAuthenticated,
  adminController.getAdminProfile
);
router.post(
  "/admin/change-password",
  isAuthenticated,
  adminController.changePassword
);
router.post(
  "/admin/update-profile",
  isAuthenticated,
  upload.single("profilePicture"),
  adminController.updateProfile
);
router.put(
  "/admin/update-category/:id",
  isAuthenticated,
  upload.single("image"),
  adminController.updateCategory
);
router.put(
  "/admin/update-subcategory/:id",
  isAuthenticated,
  upload.single("image"),
  adminController.updateSubcategory
);
router.get("/categories/:id", isAuthenticated, adminController.getCategoryById);
router.get(
  "/subcategories/:id",
  isAuthenticated,
  adminController.getSubcategoriesById
);
router.get(
  "/subcategory/:id",
  isAuthenticated,
  adminController.getSubcategoryById
);
router.delete(
  "/admin/delete-category/:id",
  isAuthenticated,
  adminController.deleteCategory
);
router.delete(
  "/admin/delete-subcategory/:id",
  isAuthenticated,
  adminController.deleteSubcategory
);

// Use POST for blocking and unblocking users
router.post("/admin/users/block/:userId", adminController.blockUser);
router.post("/admin/users/unblock/:userId", adminController.unblockUser);
router.delete("/admin/users/delete/:userId", adminController.deleteUser);
router.post("/admin/products/approve/:id", adminController.approveProducts);
router.delete("/admin/products/delete/:id", adminController.deleteProducts);

router.get("/admin/logout", isAuthenticated, adminController.getLogout);

module.exports = router;
