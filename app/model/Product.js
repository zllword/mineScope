
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
    owner : {type: Schema.Types.ObjectId, ref:'User'},
    viewCount : Number,
    likeCount : Number,
    // scopeScore : Float,
});

module.exports = mongoose.model('Product', ProductSchema);
