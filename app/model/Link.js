var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LinkSchema = new Schema({
  title: String,
  url: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  postDate: Date,
  updateDate: Date,
  viewCount : Number
});

module.exports = mongoose.model('Link',LinkSchema);
