const Joi = require('joi')

//Creating a campground schema with Joi object
module.exports.campgroundSchema = Joi.object({
    //defining campground as an object
    campground: Joi.object({
        //setting up the fields as required and appropriate data type
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
})