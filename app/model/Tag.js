
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
    title : String,
    urlString : String,
    postDate : Date,
    creator : {type: Schema.Types.ObjectId, ref:'User'},
    viewCount : Number,
    likeCount : Number,
    // scopeScore : Float,
});

module.exports = mongoose.model('Tag', TagSchema);
