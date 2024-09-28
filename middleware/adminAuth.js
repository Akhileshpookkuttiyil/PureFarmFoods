// isAuthenticated.js
const is_adminAuthenticated = (req, res, next) => {
  // Check if user session exists and user role is 'admin'
  if (req.session && req.session.user && req.session.user.role === 'admin') {
      // If authenticated as admin, proceed to the next middleware or route handler
      return next();
  } else {
      // If not authenticated as admin, redirect to the login page
      res.redirect('/login'); // Adjust the login route as per your application
  }
};

module.exports = is_adminAuthenticated;
  