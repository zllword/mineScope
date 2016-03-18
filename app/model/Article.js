
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ArticleSchema   = new Schema({
    title : String,
    cover : String,
    type : Number,
    content: String,
    postDate : Date,
    updateDate : Date,
    
    authorID : Schema.Types.ObjectId,
    authorName : String,
    authorAvatar : String,

    viewCount : Number,
    likeCount : Number,
    likeMembers : [Schema.Types.ObjectId],
    scopeScore : Number,
});

module.exports = mongoose.model('Article', ArticleSchema);