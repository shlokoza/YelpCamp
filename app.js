const express = require('express');
const req = require('express/lib/request');
const path = require('path')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')


const campground = require('./routes/campgrounds')
const reviews = require('./routes/reviews')

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



app.use('/campgrounds', campground)
app.use('/campgrounds/:id/reviews', reviews)

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
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Somthing went wrong!'
    res.status(statusCode).render('error', {err})
})

//Defining the port to listen to
app.listen(3000, () => {
    console.log(`Serving on port 3000`)
})