const User = require('../model/User');
const Product = require('../model/Product');
const Category = require('../model/categories'); // Corrected model name
const SubCategory = require('../model/subCategories'); // Corrected model name
const bcrypt = require('bcrypt');

module.exports = {
    // Utility function for error responses
    handleErrorResponse: (res, error, message = 'Server Error') => {
        console.error(message, error);
        res.status(500).json({ message });
    },

    // Render admin dashboard with data
    getHome: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const [user, products, users, categoryCount] = await Promise.all([
                User.findOne({ _id: userId }),
                Product.find(),
                User.find(),
                Category.countDocuments({}),
            ]);

            res.render('admin/admin', {
                title: 'Admin Home Page',
                user,
                products,
                users,
                reviews: [], // Placeholder for reviews
                orders: [], // Placeholder for orders
                categories: [], // Placeholder for categories
                analytics: [], // Placeholder for analytics
                categoryCount,
            });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Error fetching data for admin dashboard');
        }
    },

    // Render form to add a new category
    addCategory: async (req, res) => {
        try {
            const categories = await Category.find().sort({ name: 'asc' });
            res.render('admin/addCategory', {
                title: 'Add New Category',
                categories
            });
        } catch (err) {
            this.handleErrorResponse(res, err, 'Error fetching categories for addCategory form');
        }
    },

    // Handle submission of new category form
    postCategory: async (req, res) => {
        try {
            const { categoryName, parentCategory, addAsSubcategory } = req.body;
            const categoryImage = req.file ? req.file.filename : null;

            if (!categoryName || !categoryImage) {
                return res.status(400).json({ message: 'Name and image are required.' });
            }

            if (addAsSubcategory === 'true') {
                const parent = await Category.findById(parentCategory);
                if (!parent) {
                    return res.status(400).json({ message: 'Invalid parent category.' });
                }
                await SubCategory.create({
                    name: categoryName,
                    image: categoryImage,
                    parentCategory
                });
            } else {
                await Category.create({
                    name: categoryName,
                    image: categoryImage,
                    parentCategory: parentCategory || null
                });
            }

            res.status(200).json({ message: 'Category added successfully' });
        } catch (err) {
            this.handleErrorResponse(res, err, 'Error saving category');
        }
    },

    // Render form to add a new subcategory
    addSubcategory: async (req, res) => {
        try {
            const categories = await Category.find().sort({ name: 'asc' });
            res.render('admin/addSubcategory', {
                title: 'Add New Subcategory',
                categories
            });
        } catch (err) {
            this.handleErrorResponse(res, err, 'Error fetching categories for addSubcategory form');
        }
    },

    // Handle submission of new subcategory form
    postSubcategory: async (req, res) => {
        try {
            const { subcategoryName, parentCategory } = req.body;
            const subcategoryImage = req.file ? req.file.filename : null;

            if (!subcategoryName || !subcategoryImage) {
                return res.status(400).json({ message: 'Name and image are required.' });
            }

            await SubCategory.create({
                name: subcategoryName,
                image: subcategoryImage,
                parentCategory: parentCategory || null
            });

            res.status(200).json({ message: 'Subcategory added successfully' });
        } catch (err) {
            this.handleErrorResponse(res, err, 'Error saving subcategory');
        }
    },

    // Fetch all categories and render categories.ejs view
    getCategoriesPage: async (req, res) => {
        res.render('admin/categories', { title: 'Categories' });
    },

    // Render admin profile page
    getAdminProfile: async (req, res) => {
        try {
            const userId = req.session.user._id;
            const user = await User.findOne({ _id: userId });
            res.render('admin/adminProfile', { title: 'Profile', user });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Error fetching user profile');
        }
    },

    // Update admin profile
    updateProfile: async (req, res) => {
        try {
            const { firstName, secondName, email } = req.body;
            const admin = req.session.user;
            const updateData = { firstName, lastName: secondName, email };

            if (req.file) {
                updateData.imageUrl = req.file.filename;
            }

            const user = await User.findByIdAndUpdate(admin._id, updateData, { new: true });
            res.json({ success: true, user });
        } catch (err) {
            this.handleErrorResponse(res, err, 'Failed to update profile');
        }
    },

    // Update category details
    updateCategory: async (req, res) => {
        try {
            const { id: categoryId } = req.params;
            const { name } = req.body;
            const image = req.file ? req.file.filename : null;

            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            category.name = name;
            if (image) {
                category.image = image;
            }

            await category.save();
            res.status(200).json({ message: 'Category updated successfully', category });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Error updating category');
        }
    },
    // Update Subcategory details
    updateSubcategory: async (req, res) => {
        try {
            const { id: subcategoryId } = req.params;
            const { name } = req.body;
            const image = req.file ? req.file.filename : null;

            const subcategory = await SubCategory.findById(subcategoryId);
            if (!subcategory) {
                return res.status(404).json({ error: 'Subcategory not found' });
            }

            subcategory.name = name;
            if (image) {
                subcategory.image = image;
            }

            await subcategory.save();
            res.status(200).json({ message: 'Subcategory updated successfully', subcategory });
        } catch (error) {
            handleErrorResponse(res, error, 'Error updating subcategory');
        }
    },
    // Delete category
    deleteCategory: async (req, res) => {
        try {
            const { id: categoryId } = req.params;
            const category = await Category.findByIdAndDelete(categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Error deleting category');
        }
    },

    deleteSubcategory:async (req, res) => {
        try {
            const subcategoryId = req.params.id;
            // Assuming you have a Subcategory model and delete function
            await SubCategory.findByIdAndDelete(subcategoryId);
            res.status(200).send({ message: 'Subcategory deleted successfully' });
        } catch (error) {
            res.status(500).send({ message: 'Failed to delete subcategory', error });
        }
    },

    // Change admin password
    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            const userId = req.session.user._id;
            const user = await User.findById(userId);

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.json({ success: false, message: 'Old password is incorrect' });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            res.json({ success: true });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Error changing password');
        }
    },

    // Fetch all categories
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            const product_details = await Category.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'product_info'
                    }
                },
                {
                    $project: {
                        name: 1,
                        _id: 1,
                        product_info: 1
                    }
                }
            ]);
            res.status(200).json({ categories, product_details });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Error fetching categories');
        }
    },

    // Fetch category by ID
    getCategoryById: async (req, res) => {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.status(200).json(category);
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to fetch category');
        }
    },

    // Fetch subcategories by parent category ID
    getSubcategoriesById: async (req, res) => {
        try {
            const { id: categoryId } = req.params;
            const subcategories = await SubCategory.find({ parentCategory: categoryId });

            if (!subcategories || subcategories.length === 0) {
                return res.status(404).json({ error: 'Subcategories not found for this category ID' });
            }

            const product_details = await SubCategory.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'subcategory',
                        as: 'product_info'
                    }
                },
                {
                    $project: {
                        name: 1,
                        _id: 1,
                        product_info: 1
                    }
                }
            ]);
            console.log(product_details)
            res.status(200).json({subcategories,product_details});
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to fetch subcategories');
        }
    },

    getSubcategoryById: async (req, res) => {
        try {
            const { id: subcategoryId } = req.params;
            const subcategory = await SubCategory.findById(subcategoryId);
            console.log(`selected subcategory -- ${subcategory}`);
            if (!subcategory || subcategory.length === 0) {
                return res.status(404).json({ error: 'Subcategories not found for this subcategory ID' });
            }
            res.status(200).json(subcategory);
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to fetch subcategory');
        }
    },

    // Render view for displaying products
    viewProducts: async (req, res) => {
        try {
            const products = await Product.find();
            const productCategory = await Category.find();
            res.render('admin/viewProduct', { title: 'View Products', products,productCategory });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to fetch products');
        }
    },

    // View all users with role "user"
    viewUsers: async (req, res) => {
        try {
            const users = await User.find({ role: "user" });
            res.render('admin/viewUsers', { title: 'View Users', users });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to fetch users');
        }
    },

    // View all users with role "seller"
    viewSellers: async (req, res) => {
        try {
            const sellers = await User.find({ role: "seller" });
            res.render('admin/viewSellers', { title: 'View Sellers', users:sellers });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to fetch sellers');
        }
    },

    // Block a user by ID
    blockUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findByIdAndUpdate(userId, { blocked: true }, { new: true });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'User blocked successfully' });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to block user');
        }
    },

    // Unblock a user by ID
    unblockUser: async (req, res) => {
        try {
            const { userId } = req.params;
            const user = await User.findByIdAndUpdate(userId, { blocked: false }, { new: true });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'User unblocked successfully' });
        } catch (error) {
            this.handleErrorResponse(res, error, 'Failed to unblock user');
        }
    },

    approveProducts: async (req, res) => {
        console.log("approve");
        
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
    
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            await Product.findByIdAndUpdate(productId, { status: 'approved' });
    
            res.status(200).json({ message: 'Product approved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to approve product' });
        }
    },
    
    deleteProducts: async (req, res) => {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId);
    
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            await Product.findByIdAndDelete(productId);
    
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to delete product' });
        }
    },
}    