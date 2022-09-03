const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport')
const users = require('../controllers/users');
const user = require('../models/user');

/* ****************************** */
/* Register routers */
/* ****************************** */

router.route('/register')
    //router to render the register from
    .get(users.renderRegisterForm)
    //router to store user
    .post(catchAsync(users.register))


/* ****************************** */
/* Login routers */
/* ****************************** */
router.route('/login')
    //router to render login form
    .get(users.renderLoginForm)
    //router that authenticates the user using passport methods
    .post(passport.authenticate('local', 
        { 
            //passport methods to redirect with the error flash
            failureFlash: true, 
            failureRedirect: '/login' 
        }), users.login)



router.get('/logout', users.logout)


module.exports = router;