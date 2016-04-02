
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var VideoSchema   = new Schema({
    title : String,
    poster : String,
    type : Number,
    format: String,
    storage: String,
    description: String,
    originLink : String,

    owner : {type: Schema.Types.ObjectId, ref:'User'},
    likeMembers : [{type: Schema.Types.ObjectId, ref:'User'}],
    boards : [{type: Schema.Types.ObjectId, ref:'Board'}],
    viewCount : Number,
    likeCount : Number,
    // scopeScore : Float,
    postDate : Date,
});

module.exports = mongoose.model('Video', VideoSchema);
