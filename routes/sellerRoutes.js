const express = require('express');
const upload = require("../util/multer")
const sellerController = require('../controller/sellerController');
const isAuthenticated = require('../middleware/sellerAuth');
const router = express.Router();

router.get('/seller',isAuthenticated, sellerController.getHome);
router.get('/seller/profile',isAuthenticated, sellerController.sellerProfile);
router.get('/seller/product',isAuthenticated, sellerController.productInsert);
router.get('/seller/edit-product/:id',isAuthenticated,sellerController.editProduct)
router.delete('/seller/delete-product/:id',isAuthenticated,sellerController.deleteProduct);
router.get('/seller/manageProducts',isAuthenticated,sellerController.manageProducts);
router.get('/seller/get-subcategories/:id',isAuthenticated, sellerController.getSubcategories);
router.get('/seller/logout',isAuthenticated, sellerController.getLogout);

router.post('/seller/add-products',isAuthenticated,upload.array('images',3), sellerController.addProduct);
router.post('/seller/update-product/:id', upload.array('images'), sellerController.updateProduct);
router.post('/seller/seller-info',isAuthenticated,upload.single('image'),sellerController.sellerDetails);


module.exports = router;
