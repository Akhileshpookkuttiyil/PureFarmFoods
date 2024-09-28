const Cart = require('../model/Cart');

const setCartItemCount = async (req, res, next) => {
  console.log('Session:', req.session);
  if (req.session && req.session.user) {
    try {
      const userId = req.session.user._id;
      console.log('User ID:', userId);
      const cart = await Cart.findOne({ user: userId });
      res.locals.cartItemCount = cart ? cart.totalCount : 0;
    } catch (error) {
      console.error('Error fetching cart item count:', error);
      res.locals.cartItemCount = 0;
    }
  } else {
    res.locals.cartItemCount = 0;
  }
  next();
};

module.exports = setCartItemCount;
