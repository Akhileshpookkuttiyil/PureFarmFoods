// isAuthenticated.js
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      // If the user session exists, proceed to the next middleware or route handler
      return next();
    } else {
      // If the user session does not exist, redirect them to the login page
      res.redirect('/login');
    }
  };
  
  module.exports = isAuthenticated;
  