const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const {reviewSchema} = require('../schemas')


const validateReview = (req,res, next) => {
    //desrtucturing the error message that we get after validation
    const {error} = reviewSchema.validate(req.body);
    if(error){
        //mapping that error message
        const msg = error.details.map(el => el.message).join(',')
        //throwing that error using the custom error class
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//Creating a route to save review to corresponding campground
router.post('/', validateReview, catchAsync(async(req,res) => {
    //finding the campground that the user is browsing
    const campground = await Campground.findById(req.params.id);
    //getting review form fields and adding them to review schema
    const review = new Review(req.body.review)
    //pushing the review id to the reviews array in campground schema
    campground.reviews.push(review)
    await review.save()
    await campground.save();
    //if the process of successfull add a flash message
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route that can delete the selected review
router.delete('/:reviewId',catchAsync(async(req,res) => {
    const { id, reviewId } = req.params;
    //Deleting the review that has the reviewId from the reviews array in the campgroundSchema
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //deleting the review from the review schema
    await Review.findByIdAndDelete(reviewId)
    //if the process of successfull add a flash message
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;