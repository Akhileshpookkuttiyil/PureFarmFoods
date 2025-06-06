const User = require("../model/User"); // adjust the path as needed

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.session && req.session.user && req.session.user.role === "user") {
      const user = await User.findById(req.session.user._id);

      // Check if the user exists and is not soft-deleted or blocked
      if (!user || user.deleted || user.blocked) {
        req.session.destroy(() => {
          return res.redirect("/login");
        });
      } else {
        req.user = user; // attach full user to request
        return next();
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).send("Server error");
  }
};

module.exports = isAuthenticated;
