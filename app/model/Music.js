
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MusicSchema   = new Schema({
    title : String,
    cover : String,
    type : Number,
    format: String,
    storage: String,
    content: String,
    originLink : String,
    postDate : Date,
    owner : {type: Schema.Types.ObjectId, ref:'User'},
    viewCount : Number,
    likeCount : Number,
    // scopeScore : Float,
});

module.exports = mongoose.model('Music', Musicchema);
