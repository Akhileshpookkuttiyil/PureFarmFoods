const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
); // Add timestamps option
wishlistSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 65, // 1 minute for testing
    partialFilterExpression: { deleted: true },
  }
);
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;
