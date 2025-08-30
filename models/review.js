const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    created_at: {
        type: Date,
        default: Date.now()
    }, 
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"  
    }
})

//creating the review model object hwich is associated with the review colection present in the wonderlust database
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;