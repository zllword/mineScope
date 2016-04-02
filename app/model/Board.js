
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BoardSchema   = new Schema({
    title : String,
    description : String,
    cover : String,
    type : Number,
    postDate : Date,
    updateDate : Date,

    videos: [{ type: Schema.Types.ObjectId, ref:'Video'}],
    articles: [{ type: Schema.Types.ObjectId, ref:'Article'}],
    products:[{ type: Schema.Types.ObjectId, ref:'Product'}],
    musics: [{ type: Schema.Types.ObjectId, ref:'Music'}],
    tag: [{ type: Schema.Types.ObjectId, ref: 'Tag'}],

    owner : {type: Schema.Types.ObjectId,ref: 'User'},
    viewCount : Number,
    commentCount : Number,
    comments : [{ type: Schema.Types.ObjectId, ref: 'Comment'}],
    likeCount : Number,
    likeMembers : [{type: Schema.Types.ObjectId, ref: 'User'}],
    scopeScore : Number,
});

BoardSchema.methods.contentCount = function() {
  return this.videos.length + this.articles.length + this.products.length + this.musics.length;
}

module.exports = mongoose.model('Board', BoardSchema);
