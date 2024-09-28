const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the subcategory
const subcategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category'  // Assuming 'Category' is your parent category model
    }
});

// Create the Subcategory model based on the schema
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
