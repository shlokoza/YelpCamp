const express = require('express');
const req = require('express/lib/request');
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema, reviewSchema} = require('./schemas')
const Review = require('./models/review')

//Database setup
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//Connecting the databse if not any errors
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database connected');
})


const app = express()

//Setting up the view
app.engine('ejs', ejsMate)
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
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

//basic router
app.get('/', (req, res)=>{
    // res.send('Hello from YelpCamp!')
    res.render('home')
})

//creating campground route to fetch and display campgrounds
app.get('/campgrounds', catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds})
}))

//creating a route to render the new.ejs file
app.get('/campgrounds/new', (req,res) => {
    res.render('campgrounds/new')
})

//creating the route that saves the new campground to the database
app.post('/campgrounds', validateCampground, catchAsync(async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route to find the campground by id
app.get('/campgrounds/:id', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', {campground})
}))

//creating the route to edit the data
app.get('/campgrounds/:id/edit', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

//creating the route that updates the existing data
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route to delete the data
app.delete('/campgrounds/:id', catchAsync(async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

//Creating a route to save review to corresponding campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res) => {
    //finding the campground that the user is browsing
    const campground = await Campground.findById(req.params.id);
    //getting review form fields and adding them to review schema
    const review = new Review(req.body.review)
    //pushing the review id to the reviews array in campground schema
    campground.reviews.push(review)
    await review.save()
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route that can delete the selected review
app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req,res) => {
    const { id, reviewId } = req.params;
    //Deleting the review that has the reviewId from the reviews array in the campgroundSchema
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //deleting the review from the review schema
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//handling errors
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Somthing went wrong!'
    res.status(statusCode).render('error', {err})
})

//Defining the port to listen to
app.listen(3000, () => {
    console.log(`Serving on port 3000`)
})