
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FavoriteSchema   = new Schema({

    userID : {type: Schema.Types.ObjectId, ref: 'User'},
    userName : String,
    userAvatar : String,

    articleID : {type: Schema.Types.ObjectId, ref: 'Article' },
    articleTitle : String,
    articleCover : String
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
