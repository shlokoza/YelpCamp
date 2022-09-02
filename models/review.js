const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//creating a schema for the reviews
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    }
});

module.exports = mongoose.model('Review', reviewSchema);