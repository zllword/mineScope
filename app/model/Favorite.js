
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var FavoriteSchema   = new Schema({
    
    userID : Schema.Types.ObjectId,
    userName : String,
    userAvatar : String,

    articleID : Schema.Types.ObjectId,
    articleTitle : String,
    articleCover : String
});

module.exports = mongoose.model('Favorite', FavoriteSchema);