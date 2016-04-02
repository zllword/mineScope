
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    board: { type: Schema.Types.ObjectId, ref: 'Board' },
    title : String,
    content: String,
    postDate : Date,
    owner : {type: Schema.Types.ObjectId, ref: 'User'},

    viewCount : Number,
    likeCount : Number,
    likeMembers : [{type: Schema.Types.ObjectId, ref: 'User'}],
    scopeScore : Number,
});

module.exports = mongoose.model('Comment', CommentSchema);
