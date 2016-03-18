
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    email : String,
    password: String,
    name : String,
    gender : Boolean,
    phone : String,
    age : Number,
    lastLoginDate : Date,
});

module.exports = mongoose.model('User', UserSchema);