const express = require('express');
const req = require('express/lib/request');
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Campground = require('./models/campground')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')


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
app.post('/campgrounds', catchAsync(async (req,res,next) => {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send(req.body)
}))

//creating the route to find the campground by id
app.get('/campgrounds/:id', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground})
}))

//creating the route to edit the data
app.get('/campgrounds/:id/edit', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

//creating the route that updates the existing data
app.put('/campgrounds/:id', catchAsync(async(req,res) => {
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