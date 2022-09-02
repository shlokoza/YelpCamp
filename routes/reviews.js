const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const {validateReview, isLoggedIn, isReviewAuthor} = require('./middleware')

//Creating a route to save review to corresponding campground
router.post('/', isLoggedIn, validateReview, catchAsync(async(req,res) => {
    //finding the campground that the user is browsing
    const campground = await Campground.findById(req.params.id);
    //getting review form fields and adding them to review schema
    const review = new Review(req.body.review)
    review.author = req.user._id;
    //pushing the review id to the reviews array in campground schema
    campground.reviews.push(review)
    await review.save()
    await campground.save();
    //if the process of successfull add a flash message
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route that can delete the selected review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res) => {
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