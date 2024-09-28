const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    isSubcategory: {
        type: Boolean,
        default: false
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
