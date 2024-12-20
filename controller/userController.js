const bcrypt = require("bcrypt");
const User = require("../model/User");
const Product = require("../model/Product");
const Cart = require("../model/Cart");
const Category = require("../model/categories"); // Corrected model name
const SubCategory = require("../model/subCategories"); // Corrected model name
const Wishlist = require("../model/wishlist");
const { none } = require("../util/multer");
const crypto = require("crypto");

module.exports = {
  getLogin: (req, res) => {
    const error = req.session.error || {};
    const user = req.session.user;
    delete req.session.error;
    res.render("login", { title: "Login", error, user });
  },

  getSignup: (req, res) => {
    const error = req.session.error || {};
    delete req.session.error;
    res.render("signup", { title: "Signup", error, user: req.session.user });
  },

  getHome: async (req, res) => {
    try {
      // Fetch the vegetable category
      const vegetableCategory = await Category.findOne({ name: "vegetables" });
      if (!vegetableCategory) {
        return res
          .status(404)
          .json({ message: "Vegetable category not found" });
      }

      // Fetch products in the vegetable category
      const products = await Product.find({
        category: vegetableCategory._id,
      }).populate("category");

      // Initialize wishlistProductIds
      let wishlistProductIds = [];

      // If the user is logged in, get their wishlist
      const user = req.session.user;
      if (user) {
        const wishlist = await Wishlist.findOne({ user: user._id });
        if (wishlist) {
          wishlistProductIds = wishlist.products.map((productId) =>
            productId.toString()
          );
        }
      }

      // Add wishlist status to each product
      const productsWithWishlistStatus = products.map((product) => ({
        ...product.toObject(),
        isProductInWishlist: wishlistProductIds.includes(
          product._id.toString()
        ),
      }));

      // Render the view with updated products
      res.render("index", {
        title: "Home",
        user: req.session.user,
        products: productsWithWishlistStatus,
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getShop: (req, res) => {
    res.render("shop", { title: "Shop by category", user: req.session.user });
  },

  getContact: (req, res) => {
    res.render("contact", { title: "Contact Page", user: req.session.user });
  },

  getcheckOut: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product"
      ); // Populate product details

      res.render("checkout", { title: "Checkout Page", cart, user });
    } catch (error) {
      console.error("Error fetching cart data:", error);
      res.status(500).send("Error fetching cart data");
    }
  },

  getCart: (req, res) => {
    res.render("cart", { title: "cart Page", user: req.session.user });
  },

  getSettings: (req, res) => {
    res.render("userSettings", {
      title: "user-Setting Page",
      user: req.session.user,
    });
  },

  createUser: async (req, res) => {
    try {
      // Initialize req.session.error as an object
      req.session.error = {};

      function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }

      function isStrongPassword(password) {
        if (password.length < 8) {
          return false;
        }
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        const specialCharacterRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        return (
          uppercaseRegex.test(password) &&
          lowercaseRegex.test(password) &&
          numberRegex.test(password) &&
          specialCharacterRegex.test(password)
        );
      }

      const { firstName, lastName, email, password, confirm_password } =
        req.body;

      // Ensure all fields are provided
      if (!firstName || !lastName || !email || !password || !confirm_password) {
        req.session.error.fieldError = "All fields are required";
        return res.redirect("/signup");
      }

      // Check if passwords match
      if (password !== confirm_password) {
        req.session.error.passwordError = "Passwords do not match";
        return res.redirect("/signup");
      }

      // Check if the email format is valid
      if (!isValidEmail(email)) {
        req.session.error.emailError = "Invalid email format";
        return res.redirect("/signup");
      }

      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.session.error.userError = "Email already exists";
        return res.redirect("/signup");
      }

      // Check if the password meets criteria
      if (!isStrongPassword(password)) {
        req.session.error.passwordError = "Password does not meet criteria";
        return res.redirect("/signup");
      }

      // Hash the password before saving the user
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user and save it to the database
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      // Clear errors if user creation was successful
      delete req.session.error;

      // Respond with success message and the created user data
      return res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  checkUser: async (req, res) => {
    const { email, password } = req.body;

    try {
      req.session.error = {};

      if (!email || !password) {
        req.session.error.loginError = "Email and password are required";
        return res.redirect("/login");
      }

      const user = await User.findOne({ email });
      if (!user) {
        req.session.error.loginError = "No user found";
        return res.redirect("/login");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.session.error.loginError = "Wrong password";
        return res.redirect("/login");
      }

      req.session.user = user;
      console.log(user.role);
      if (user.role === "admin") {
        return res.redirect("/admin");
      } else if (user.role === "seller") {
        return res.redirect("/seller");
      } else {
        return res.redirect("/");
      }
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  updateUserDetails: async (req, res) => {
    console.log("update");

    try {
      const userId = req.session.user._id; // Assuming user ID is stored in session

      const { firstName, lastName, gender, email, phone } = req.body;

      const updatedData = {
        firstName,
        lastName,
        gender,
        email,
        phone,
      };

      // If a profile picture is uploaded, include it in the update
      if (req.file) {
        updatedData.imageUrl = `${req.file.filename}`;
      }
      // Find the user by ID and update their profile
      await User.findByIdAndUpdate(userId, updatedData);
      // Respond with success
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.json({ success: false, message: "Error updating profile" });
    }
  },

  getUserProfile: async (req, res) => {
    const userId = req.session.user._id; // Optional chaining in case user is undefined

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID not found in session" });
    }

    try {
      console.log("Fetching data for user ID:", userId); // Add this log
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      res.json({
        success: true,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
      res
        .status(500)
        .json({ success: false, message: "Error fetching user data" });
    }
  },

  changePassword: async (req, res) => {
    try {
      console.log("Request body:", req.body);

      const { newPassword, oldPassword } = req.body; // Destructure directly from req.body

      const userId = req.session.user._id;
      console.log("User ID:", userId);

      // Find the user by userId
      const user = await User.findById(userId);
      console.log("User:", user);

      // Ensure user exists
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Ensure both newPassword and oldPassword are provided and are strings
      if (typeof newPassword !== "string" || typeof oldPassword !== "string") {
        return res.status(400).json({
          message:
            "Invalid request. newPassword and oldPassword must be strings.",
        });
      }

      // Compare the old password provided by the user with the hashed password stored in the database
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      console.log("Password match:", isMatch);

      // If passwords don't match, return an error response
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Old password is incorrect" });
      }

      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log("Hashed Password:", hashedPassword);

      // Update user's password with the new hashed password
      user.password = hashedPassword;
      await user.save();

      // Respond with success message
      res.json({ success: true });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  searchResults: async (req, res) => {
    console.log("search");

    try {
      const { query } = req.query;

      // Validate the search query
      if (!query || query.trim() === "") {
        return res
          .status(400)
          .json({ message: "Search query cannot be empty" });
      }

      // Create a regular expression for case-insensitive search
      const regex = new RegExp(query, "i");

      // Search for products matching the query in either name or description
      const products = await Product.find({
        $or: [{ name: regex }, { description: regex }],
      }).populate("category");

      // Check if products are found
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }

      // Render the search results page with products
      res.render("searchResults", {
        title: "Search Results",
        products,
        user: req.session.user,
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      if (!req.session || !req.session.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized access" });
      }
  
      const userId = req.session.user._id; // Get user ID from session
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
  
      // Delete the user's cart and wishlist
      await Cart.deleteOne({ user: userId });
      await Wishlist.deleteOne({ user: userId });
  
      // Delete the user
      const deleteResult = await User.deleteOne({ _id: userId });
  
      if (deleteResult.deletedCount > 0) {
        // Clear session data after deletion
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
            return res
              .status(500)
              .json({ success: false, message: "Internal server error" });
          }
          res
            .status(200)
            .json({ success: true, message: "Account deleted successfully" });
        });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },  

  getCategories: async (req, res) => {
    try {
      // Fetch categories with counts of approved products
      const categories = await Category.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
          },
        },
        {
          $addFields: {
            // Count only the approved products
            product_count: {
              $size: {
                $filter: {
                  input: "$products",
                  as: "product",
                  cond: { $eq: ["$$product.status", "approved"] },
                },
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            _id: 1,
            product_count: 1,
            image: 1, // Include the image if needed
          },
        },
      ]);

      // Fetch the total number of approved products across all categories
      const totalProducts = await Product.countDocuments({
        status: "approved",
      });

      // Return categories along with total approved product count
      res.json({ categories, totalProducts });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },
  getProductsByCategory: async (req, res) => {
    try {
      const categoryId = req.params.id;

      // Find products by category and populate the category field
      const products = await Product.find({ category: categoryId }).populate(
        "category"
      );

      // Check if the user is authenticated
      let wishlist = null;
      const user = req.session.user;
      if (user) {
        wishlist = await Wishlist.findOne({ user: user._id });
      }

      // Return both products and wishlist as a single JSON object
      res.json({
        products: products,
        wishlist: wishlist ? wishlist.products : [], // Return the wishlist products array or an empty array
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const { id, sort, maxPrice, search } = req.query;
      let query = {};

      // Filter by category ID if provided
      if (id) {
        query.category = id;
        console.log("Filtering by Category ID:", id); // Debugging
      }

      // Apply price filter if maxPrice is provided
      if (maxPrice) {
        query.price = { $lte: parseFloat(maxPrice) }; // Less than or equal to maxPrice
        console.log("Applying maxPrice filter:", maxPrice); // Debugging
      }

      // Apply search filter if search query is provided
      if (search) {
        const regex = new RegExp(search, "i"); // Case-insensitive search
        query.$or = [{ name: regex }, { description: regex }];
        console.log("Applying search filter:", search); // Debugging
      }

      // Determine sort order based on the sort parameter
      let sortOrder = {};
      switch (sort) {
        case "popularity":
          sortOrder = { popularity: -1 }; // Sort by popularity descending
          break;
        case "price_asc":
          sortOrder = { price: 1 }; // Sort by price ascending
          break;
        case "price_desc":
          sortOrder = { price: -1 }; // Sort by price descending
          break;
        case "rating":
          sortOrder = { rating: -1 }; // Sort by rating descending
          break;
        case "newest":
          sortOrder = { createdAt: -1 }; // Sort by newest first
          break;
        default:
          sortOrder = {}; // No sorting
          break;
      }

      // Check if the user is authenticated
      let wishlist = null;
      const user = req.session.user;
      if (user) {
        wishlist = await Wishlist.findOne({ user: user._id });
      }

      console.log("Sorting with:", sortOrder); // Debugging
      console.log(query);

      // Fetch products based on the query and sort order
      const products = await Product.find(query)
        .populate("category")
        .sort(sortOrder);
      // Return the products and wishlist as JSON
      res.json({
        products,
        wishlist: wishlist ? wishlist.products : [], // Return the wishlist products array or an empty array
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Example of a route to render shop-detail with product data
  getProductdetail: async (req, res) => {
    try {
      const ProductName = req.params.name;

      // Find the product by name
      const product = await Product.findOne({ name: ProductName });
      if (!product) {
        return res.status(404).send("Product not found");
      }

      // Check if the user is authenticated
      const user = req.session.user;
      let isProductInWishlist = false;

      if (user) {
        const wishlist = await Wishlist.findOne({ user: user._id });

        // Check if the product is in the wishlist
        isProductInWishlist =
          wishlist && wishlist.products.includes(product._id);
      }

      // Render the product detail page
      res.render("shopDetail", {
        title: "Shop by category",
        product, // Pass the product data to the template
        user: user, // Pass user data if available
        isProductInWishlist: isProductInWishlist,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getVegetables: async (req, res) => {
    try {
      const vegetableCategory = await Category.findOne({ name: "vegetables" });
      const products = await Product.find({
        category: vegetableCategory._id,
      }).populate("category");
      res.json(products); // Return the products as JSON
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  addToCart: async (req, res) => {
    console.log("cart");
    try {
      console.log(req.session.user);
      const userId = req.session.user._id;
      const productId = req.body.productId;
      let quantity = parseInt(req.body.quantity);

      if (!quantity || quantity < 1) {
        quantity = 1; // Default to 1 if quantity is invalid
      }

      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Find the user's cart or create a new one
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, products: [] });
      }

      // Find the product in the cart
      const productInCart = cart.products.find(
        (item) => item.product.toString() === productId
      );
      if (productInCart) {
        // If the product is already in the cart, update the quantity
        productInCart.quantity += quantity;
      } else {
        // If the product is not in the cart, add it
        cart.products.push({ product: productId, quantity });
      }

      // Save the updated cart
      await cart.save();

      res
        .status(200)
        .json({ message: "Product added to cart successfully", cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getCartDetails: async (req, res) => {
    try {
      const userId = req.session.user._id; // Assuming you have user info in req.user
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product"
      );
      if (cart) {
        res.json(cart);
      } else {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ error: "Error fetching cart data" });
    }
  },

  getCartCount: async (req, res) => {
    try {
      const userId = req.session.user._id;
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found', CartCount: 0 });
      }
      const CartCount = cart.totalCount;
      res.json(CartCount);
    } catch (err) {
      console.log(err.message);
    }
  },

  updateCart: (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId; // or however you manage your session

    Cart.findOne({ userId })
      .then((cart) => {
        const product = cart.products.find(
          (item) => item.product._id.toString() === productId
        );
        if (product) {
          product.quantity = quantity;
          return cart.save();
        }
        throw new Error("Product not found in cart");
      })
      .then((updatedCart) => {
        const updatedProduct = updatedCart.products.find(
          (item) => item.product._id.toString() === productId
        );
        res.json(updatedProduct);
      })
      .catch((error) => res.status(500).json({ error: error.message }));
  },

  deleteCart: (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId; // or however you manage your session

    Cart.findOne({ userId })
      .then((cart) => {
        cart.products = cart.products.filter(
          (item) => item.product.toString() !== productId
        );
        return cart.save();
      })
      .then(() => res.json({ message: "Product removed from cart" }))
      .catch((error) => res.status(500).json({ error: error.message }));
  },

  // Add or remove a product from the wishlist
  addToWishlist: async (req, res) => {
    const { productId, action } = req.body;
    const userId = req.session.user._id; // Assuming the user ID is stored in session

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    try {
      let wishlist = await Wishlist.findOne({ user: userId });

      // Create a new wishlist if one doesn't exist
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      if (action === "add") {
        // Add product if not already in wishlist
        if (!wishlist.products.includes(productId)) {
          wishlist.products.push(productId);
        } else {
          return res
            .status(400)
            .json({ message: "Product is already in the wishlist." });
        }
      } else if (action === "remove") {
        // Remove product from wishlist
        wishlist.products = wishlist.products.filter(
          (id) => id.toString() !== productId
        );
      } else {
        return res
          .status(400)
          .json({ message: "Invalid action. Use 'add' or 'remove'." });
      }

      // Save the updated wishlist
      await wishlist.save();
      res.json({ message: `Product ${action}ed to wishlist successfully!` });
    } catch (error) {
      console.error("Error updating wishlist:", error);
      res.status(500).json({ message: "Error updating wishlist" });
    }
  },

  // Get the user's wishlist
  getWishlist: async (req, res) => {
    const userId = req.session.user._id; // Assuming the user ID is stored in session

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    try {
      const wishlist = await Wishlist.findOne({ user: userId }).populate(
        "products"
      );

      if (!wishlist) {
        // If no wishlist found, render with empty wishlist
        return res.render("wishlist", {
          title: "My Wishlist",
          user: req.session.user,
          wishlistItems: [], // Pass an empty array if no wishlist found
        });
      }

      // Render the wishlist view and pass the wishlist items
      res.render("wishlist", {
        title: "My Wishlist",
        user: req.session.user,
        wishlistItems: wishlist.products, // Pass the products in the wishlist
      });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Error fetching wishlist" });
    }
  },

  getLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error during logout:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.redirect("/login");
    });
  },
};
