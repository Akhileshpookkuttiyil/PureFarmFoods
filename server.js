const twilio=require('twilio')
const express = require('express');
const path = require('path');
const app = express();
const connectDB = require('./database/db');
const session=require("express-session")

// const setCartItemCount = require('./middleware/cartItemCount');


const userRouter = require("./routes/userRoutes")
const adminRouter = require("./routes/adminRoutes")
const cartRouter = require("./routes/cartRoutes")
const sellerRouter = require("./routes/sellerRoutes")

// Connect to database

connectDB();
const secretKey = process.env.SECRET_KEY;

app.use((req, res, next) => {
    res.locals.user = req.user; // assuming req.user contains the user information
    next();
});

// Middleware
app.use(express.json());
app.use(session({
    secret: secretKey, // Change this to a more secure random string
    resave: false,
    saveUninitialized: false
}));
// app.use(setCartItemCount);
app.use(express.urlencoded({ extended: true }));
app.use("/",userRouter,cartRouter,adminRouter,sellerRouter)
// app.get("/cart",cartRouter)
// app.get("/admin",adminRouter)
// app.get("/seller-home",sellerRouter)
// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.set('view engine', 'ejs');

// Routes

// Home route

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}/`);
});
