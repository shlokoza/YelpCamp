const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//creating a schema for the reviews
const reviewSchema = new Schema({
    body: String,
    rating: Number,
});

module.exports = mongoose.model('Review', reviewSchema);