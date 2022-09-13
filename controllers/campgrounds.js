const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const Campground = require('../models/campground')
const {cloudinary} = require('../cloudinary')

module.exports.index = async (req, res)=>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds})
}

module.exports.jsonData = async(req,res) => {
    const campgrounds = await Campground.find();
    res.send(campgrounds);
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new')
}

module,exports.createCampground = async (req,res,next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    //saving goematry of the location
    campground.geomatry = geoData.body.features[0].geometry;
    //saving the image files
    campground.images = req.files.map(f => ({ url : f.path, filename: f.filename }));
    //setting author to the current user's id
    campground.author = req.user._id;
    await campground.save();
    console.log(campground)
    //if the process of successfull add a flash message
    req.flash('success', 'Created new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.showCampgrounds = async(req,res) => {
    const campground = await Campground.findById(req.params.id)
    //populating the reviews with the author of the review.
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');//this will be the author of the campground.
    //console.log(campground)
    //if campground not found redirect to campground poge with an error flash message
    if(!campground){
        req.flash('error', 'Campoground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async(req,res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id)
    //if user tries to edit the campground that does not exist, redirect to campground poge with an error flash message
    if(!campground){
        req.flash('error', 'Campoground not found!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
}

module.exports.updateCampground = async(req,res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    //pushing newly added images to campground
    const imgs = req.files.map(f => ({ url : f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    //if user has requisted to delete any images...
    if(req.body.deleteImages){
        //first delete them from cloudinary...
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        //then from campground.
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages }}}})
        console.log(campground)
    }
    //if the process of successfull add a flash message
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground!')
    res.redirect('/campgrounds')
}