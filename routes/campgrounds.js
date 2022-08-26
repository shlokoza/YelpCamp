const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const {campgroundSchema} = require('../schemas')


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


//creating campground route to fetch and display campgrounds
router.get('/', catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds})
}))

//creating a route to render the new.ejs file
router.get('/new', (req,res) => {
    res.render('campgrounds/new')
})

//creating the route that saves the new campground to the database
router.post('/', validateCampground, catchAsync(async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    //if the process of successfull add a flash message
    req.flash('success', 'Created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route to find the campground by id
router.get('/:id', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews')
    //if campground not found redirect to campground poge with an error flash message
    if(!campground){
        req.flash('error', 'Campoground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}))

//creating the route to edit the data
router.get('/:id/edit', catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    //if user tries to edit the campground that does not exist, redirect to campground poge with an error flash message
    if(!campground){
        req.flash('error', 'Campoground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}))

//creating the route that updates the existing data
router.put('/:id', validateCampground, catchAsync(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    //if the process of successfull add a flash message
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

//creating the route to delete the data
router.delete('/:id', catchAsync(async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!')
    res.redirect('/campgrounds')
}))

module.exports = router;