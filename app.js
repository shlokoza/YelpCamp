if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');

const usersRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

//Database setup
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//Connecting the databse if not any errors
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database connected');
})


const app = express()

//Setting up the view and view dir.
app.engine('ejs', ejsMate)
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))


//difining configs for the session
const sessionConfig = {
    secret: 'ThisShouldBeABetterSecret',
    resave: false,
    saveUninitialized: true,
    //setting up cookie expiration and age.
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//using the session with the defined configs
app.use(session(sessionConfig));
//using flash for every route
app.use(flash());

//Setting up passport on our user model
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    //setting returnTo property from session
    res.locals.returnTo = req.session.returnTo;
    //setting currentUser property to currently logged in user in res.locals
    res.locals.currentUser = req.user;
    //adding the flash messege to the res.locals so we can access it.
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//using the routes
app.use('/', usersRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

//basic router
app.get('/', (req, res)=>{
    // res.send('Hello from YelpCamp!')
    res.render('home')
})

//If any page not found, throw 404 error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//handling errors
app.use((err, req, res, next) => {
    //giving default value for status code.
    const {statusCode = 500} = err;
    //If no error msg found use this msg.
    if(!err.message) err.message = 'Somthing went wrong!'
    res.status(statusCode).render('error', {err})
})

//Defining the port to listen to
app.listen(3000, () => {
    console.log(`Serving on port 3000`)
})