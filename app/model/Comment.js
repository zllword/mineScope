
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    title : String,
    cover : String,
    images : [String],
    type : Number,
    content: String,
    buyLink : String,
    postDate : Date,
    
    posterID : Schema.Types.ObjectId,
    posterName : String,
    posterAvatar : String,

    viewCount : Number,
    likeCount : Number,
    scopeScore : float,
});

module.exports = mongoose.model('Comment', CommentSchema);