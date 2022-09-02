const {campgroundSchema, reviewSchema} = require('../schemas')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const Review = require('../models/review')

module.exports.isLoggedIn = (req, res, next) => {
    //if user in not signed in then redirect them to login page
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    //desrtucturing the error message that we get after validation
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        //mapping that error message
        const msg = error.details.map(el => el.message).join(',')
        //throwing that error using the custom error class
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//checking if the campground is owned by the user currently logged in.
module.exports.isAuthor = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)){
        //if not, flash the message and redirect to the selected campground page
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}



module.exports.validateReview = (req,res, next) => {
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

//checking if the review is owned by the user currently logged in.
module.exports.isReviewAuthor = async(req,res,next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)){
        //if not, flash the message and redirect to the selected campground page
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


