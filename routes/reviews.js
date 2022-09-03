const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground')
const Review = require('../models/review')
const reviews = require('../controllers/reviews')
const catchAsync = require('../utils/catchAsync')
const {validateReview, isLoggedIn, isReviewAuthor} = require('./middleware')


//Creating a route to save review to corresponding campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//creating the route that can delete the selected review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;