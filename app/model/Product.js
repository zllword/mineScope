
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProductSchema   = new Schema({
    title : String,
    cover : String,
    images : [String],
    type : Number,
    content: String,
    originLink : String,
    buyLink : String,
    postDate : Date,

    posterID : Schema.Types.ObjectId,
    posterName : String,
    posterAvatar : String,

    viewCount : Number,
    likeCount : Number,
    // scopeScore : Float,
});

module.exports = mongoose.model('Product', ProductSchema);
