const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

//using virtual to add width property after /upload in image url.
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

//Creating a schema for the campgrounds
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
]
});


//Creating a middleware to delete the reviews of the deleted campground
CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);