const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport')

/* ****************************** */
/* Register routers */
/* ****************************** */
//router to render the register from
router.get('/register', (req,res) => {
    res.render('users/register');
});

//router to store user
router.post('/register', catchAsync(async (req,res) => {
    try{
        // getting and destructuring the fields from req.body
        const {username, email, password} = req.body;
        //passing the email and username to the user model
        const user = new User({email, username});
        //using register method from passport to hash the password and store it
        const registedUser = await User.register(user, password);
        //login method logs in the newly registered user.
        req.login(registedUser, err => {
            if(err) return next(err);
            //flashing the success message and redirecting to campgrounds page
            req.flash('success', 'Account created!');
            res.redirect('/campgrounds')
        })
    }
    catch(e){
        //if any errors then redirecting to the register form with an error message
        req.flash('error', e.message);
        res.redirect('register')
    }

    
}));


/* ****************************** */
/* Login routers */
/* ****************************** */
//router to render login form
router.get('/login', (req,res) => {
    res.render('users/login');
});

//router that authenticates the user using passport methods
router.post('/login', passport.authenticate('local', 
{ 
    //passport methods to redirect with the error flash
    failureFlash: true, 
    failureRedirect: '/login' 
}), (req, res) => {
    //if authentication success, flash the message and redirect to the campgrounds poge
    req.flash('success', 'Successfully logged in!');
    //setting the url to redirect to. if not found in locals,returnTo then use /campgrounds
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.locals.returnTo = "";
    res.redirect(redirectUrl);
});

router.get('/logout', (req,res) => {
    req.logout(function(err) {
        if (!err){ 
            req.flash('success', "Goodbye! logged out!")
            return res.redirect('/campgrounds'); 
        }
        else{
            req.flash('error', err.message);
            return res.redirect('/campgrounds');
        }
    })
})


module.exports = router;