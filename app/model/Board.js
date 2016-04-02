
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BoardSchema   = new Schema({
    title : String,
    description : String,
    cover : String,
    type : Number,
    content: String,
    postDate : Date,
    updateDate : Date,

    owner : {type: Schema.Types.ObjectId,ref: 'User'},
    viewCount : Number,
    likeCount : Number,

    likeMembers : [{type: Schema.Types.ObjectId, ref: 'User'}],
    scopeScore : Number,
});

module.exports = mongoose.model('Board', BoardSchema);
