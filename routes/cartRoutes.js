const express = require('express');
const cartController = require('../controller/cartController');
const cartRouter=express.Router()


cartRouter.get("/cart",cartController.getCart)


module.exports=cartRouter
