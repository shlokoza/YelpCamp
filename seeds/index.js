const mongoose = require('mongoose')

//importing the external files
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground')

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
});

//making a function that gives random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)]

//creating a dummy campground and pushing it to the databse
const seedDB = async() => {
    await Campground.deleteMany({});
    //creating 50 fake camp sites
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //using the cities ||/& seedhelpers file for the data
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //getting random image from unsplash
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Perspiciatis animi incidunt deleniti vitae? Modi vero, veritatis non soluta ipsam aspernatur nam, consectetur atque est corporis laudantium? Dolore commodi rerum aliquam?',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})