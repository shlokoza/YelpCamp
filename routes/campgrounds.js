const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('./middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });


router.route('/')
    //creating campground route to fetch and display campgrounds
    .get(catchAsync(campgrounds.index))
    //creating the route that saves the new campground to the database
    .post(
        isLoggedIn, 
        upload.array('image'),
        validateCampground, 
        catchAsync(campgrounds.createCampground)
    )

//creating a route to render the new.ejs file
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    //creating the route to find the campground by id
    .get(catchAsync(campgrounds.showCampgrounds))
    //creating the route that updates the existing data
    .put(isLoggedIn, 
        isAuthor, 
        upload.array('image'), 
        validateCampground, 
        catchAsync(campgrounds.updateCampground)
    )
    //creating the route to delete the data
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


//creating the route to edit the data
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;