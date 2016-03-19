
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ArticleSchema   = new Schema({
    title : String,
    cover : String,
    type : Number,
    content: String,
    postDate : Date,
    updateDate : Date,

    authorID : {type: Schema.Types.ObjectId,ref: 'User'},
    authorName : String,
    authorAvatar : String,

    viewCount : Number,
    likeCount : Number,
    likeMembers : [{type: Schema.Types.ObjectId, ref: 'User'}],
    scopeScore : Number,
});

module.exports = mongoose.model('Article', ArticleSchema);
