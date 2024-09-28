const express = require('express');
const userController=require("../controller/userController")
const upload = require("../util/multer")
const isAuthenticated = require('../middleware/authMiddleware');

const router=express.Router()
router.get("/",userController.getHome)
router.get("/login",userController.getLogin)
router.get("/signup",userController.getSignup)
router.get("/shop",userController.getShop)
router.get("/cart",isAuthenticated,userController.getCart)
router.get("/cart/cartByUserId",isAuthenticated,userController.getCartDetails)
router.get('/cart/item-count',isAuthenticated,userController.getCartCount)
router.get('/search-results', userController.searchResults);
router.get("/checkout",userController.getcheckOut);


router.get("/contact",userController.getContact)
router.get("/settings",isAuthenticated,userController.getSettings)
router.get("/logout",isAuthenticated,userController.getLogout)
router.delete("/user/delete-Account",isAuthenticated,userController.deleteAccount)

router.post('/users', userController.createUser);
router.post("/user/change-password",isAuthenticated,userController.changePassword)
router.post('/check-user', userController.checkUser);
router.post('/user/update-profile',isAuthenticated,upload.single('profilePicture'),userController.updateUserDetails)
router.post('/cart/add/',isAuthenticated,userController.addToCart);
router.post('/cart/update',isAuthenticated,userController.updateCart)
router.post('/cart/delete',isAuthenticated,userController.deleteCart)
router.post('/user/wishlist',isAuthenticated,userController.addToWishlist);

router.get("/users/get-categories",userController.getCategories);
router.get('/user/profile-data',userController.getUserProfile);
router.get('/category/:id/products', userController.getProductsByCategory);
router.get('/get-All-products/:id?', userController.getAllProducts);
router.get("/product-detail/:name", userController.getProductdetail);
router.get('/get-All-vegetables', userController.getVegetables);



module.exports=router

