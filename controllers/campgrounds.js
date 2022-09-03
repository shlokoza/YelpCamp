const Campground = require('../models/campground')

module.exports.index = async (req, res)=>{
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new')
}

module,exports.createCampground = async (req,res,next) => {
    const campground = new Campground(req.body.campground);
    //setting author to the current user's id
    campground.author = req.user._id;
    await campground.save();
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
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
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