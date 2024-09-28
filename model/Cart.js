const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  products: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        validate: {
          validator: Number.isInteger,
          message: '{VALUE} is not an integer value'
        }
      }
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  totalCount: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

CartSchema.pre('save', async function (next) {
  try {
    let cart = this;
    if (!cart.isModified('products')) return next();

    const Product = mongoose.model('Product');
    const productIds = cart.products.map(item => item.product);
    
    // Fetch all products in a single query
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    
    let total = 0;
    let count = 0;

    // Create a map for quick product lookup
    const productMap = new Map(products.map(product => [product._id.toString(), product]));

    for (let item of cart.products) {
      const product = productMap.get(item.product.toString());
      if (product) {
        total += product.price * item.quantity;
        count += item.quantity;
      }
    }

    cart.totalPrice = total;
    cart.totalCount = count;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Cart', CartSchema);
