
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    post: { type: Schema.Types.ObjectId },
    type: { type: String, enum:['Article','Link','Product']},
    title : String,
    cover : String,
    images : [String],
    type : Number,
    content: String,
    buyLink : String,
    postDate : Date,

    posterID : {type: Schema.Types.ObjectId, ref: 'User'},
    posterName : String,
    posterAvatar : String,

    viewCount : Number,
    likeCount : Number,
    scopeScore : float,
});

module.exports = mongoose.model('Comment', CommentSchema);
