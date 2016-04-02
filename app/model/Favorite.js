
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FavoriteSchema   = new Schema({

    user : {type: Schema.Types.ObjectId, ref: 'User'},

    board : { type: Schema.Types.ObjectId, ref: 'Board'},

    article : {type: Schema.Types.ObjectId, ref: 'Article' },

    music : { type: Schema.Types.ObjectId, ref: 'Music'},

    video : { type : Schema.Types.ObjectId, ref: 'Video'},

    comment : { type : Schema.Types.ObjectId, ref: 'Comment'},
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
