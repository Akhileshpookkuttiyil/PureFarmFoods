const mongoose = require('mongoose')
const Product = require('../model/Product');
const Seller = require("../model/Seller");
const Category = require('../model/categories');
const Subcategory = require('../model/subCategories'); // Corrected model name
const User = require('../model/User')
const { ObjectId } = mongoose.Types;

module.exports = {
  getHome: async (req, res) => {
    try {
        const userId = req.session.user._id;
        const currentUser = await User.findById(userId).populate('seller').exec();
        res.render('seller/sellerPage', { title: 'Seller homePage', currentUser:currentUser.seller });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
},
  sellerProfile: (req, res) => {
    res.render('seller/profile', { title: 'Seller homePage',user:req.session.user });
  },
  productInsert: async (req, res) => {
    const categories = await Category.find().sort({ name: 'asc' });
    const Subcategories = await Subcategory.find().sort({ name: 'asc' });
    res.render('seller/product', { title: 'product Page', categories, Subcategories });
  },
  editProduct:async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category subcategory');
        const categories = await Category.find();
        const subcategories = await Subcategory.find();
        res.render('seller/updateProduct', { product, categories,subcategories });
    } catch (err) {
        console.error(err);
    }
},

deleteProduct: async (req, res) => {
  console.log("delete");
  
  try {
      const productId = req.params.id;
      console.log(productId);
      
      const deletedProduct = await Product.findByIdAndDelete(productId);
      console.log(deletedProduct);
    
      if (!deletedProduct) {
          return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product deleted successfully', productId });
  } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Server error' });
  }
}
,
  getSubcategories: async (req, res) => {
    try {
      const { id: categoryId } = req.params;
      const subcategories = await Subcategory.find({ parentCategory: categoryId });
      res.json(subcategories);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      res.status(500).json({ message: 'Failed to fetch subcategories' });
    }
  },
  manageProducts: async(req, res) => {
    const seller_info = req.session.user._id
    const products = await Product.find({ seller: seller_info }).sort({ name: 'asc' });
    res.render('seller/viewProducts', { title: 'Manage products' ,products});
  },
  addProduct: async (req, res) => {
    console.log(req.body);
    console.log(req.files);
    try {
      const { name, description, size, price, stock, discount, discountType, category, Subcategory } = req.body;
      const seller_info = req.session.user._id
      console.log("seller:", seller_info);
      const imageField = req.files.map(file => file.filename);
      console.log(imageField);
      const newProduct = await Product.create({
        name,
        description,
        size,
        price,
        stock,
        discount,
        discountType,
        images: imageField,
        category,
        subcategory: Subcategory,
        seller: seller_info
      })
      res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
  },

  updateProduct: async (req, res) => {
    try {
        console.log("update");
        const productId = req.params.id;
        const { name, description, size, price, stock, discount, discountType, category, subcategory } = req.body;

        // Handle uploaded images
        const imageFiles = req.files;
        let imagePaths = [];

        // Fetch the current product
        const currentProduct = await Product.findById(productId);

        if (!currentProduct) {
            return res.status(404).send('Product not found');
        }

        if (imageFiles && imageFiles.length > 0) {
            // Collect filenames of uploaded images
            imagePaths = imageFiles.map(file => file.filename);
        } else {
            // If no new images, keep the existing ones
            imagePaths = currentProduct.images;
        }

        // Find and update the product
        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            name,
            description,
            size,
            price,
            stock,
            discount,
            discountType,
            category,
            subcategory,
            images: imagePaths // Save new image paths or existing ones if no new images
        }, { new: true }); // Return the updated product

        // Respond with the updated product
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Server error');
    }
}
,

  sellerDetails : async (req, res) => {
    try {
        const {
            userId,
            username,
            firstName,
            lastName,
            organizationName,
            location,
            email,
            phone,
            countryCode,
            bankName,
            accountNumber,
            ifscCode,
            gstNumber
        } = req.body;
        console.log(req.body);

        // Check if a file was uploaded
        const profileImage = req.file ? req.file.filename : null;

        console.log('Uploaded profile image:', profileImage);

        if (!ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }

        // Create new seller
        const seller = await Seller.create({
            username,
            firstName,
            lastName,
            organizationName,
            location,
            email,
            phone,
            countryCode,
            bankDetails: {
                bankName,
                accountNumber,
                ifscCode
            },
            gstNumber,
            profileImage
        });

        // Convert userId to ObjectId
        const userObjectId = new ObjectId(userId);

        // Update user with sellerId
        await User.findByIdAndUpdate(userObjectId, { seller: seller._id, role: 'seller' });

        res.status(200).send('Seller details saved successfully');
    } catch (error) {
        console.error('Error saving seller details:', error);
        res.status(500).send('Error saving seller details: ' + error.message);
    }
},



  getLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.redirect('/login');
    });
  }

};
