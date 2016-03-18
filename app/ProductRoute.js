var config = require('../config');
var restify = require('restify');
var Product = require('./model/Product');

var ProductRoute = {
  getProducts : function(req, res, next) {
    var keyword = req.params.keyword;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;
    Product.find({},function(err,docs){
      console.log(docs);
      if(err) {
        res.send(500);
      }else{
          res.send(200,{data : docs});
      }

    });
  },
  addProduct : function(req, res, next) {
    var name = req.params.name;
    var originLink = req.params.originLink;
    var cover = req.params.cover;
    var images = req.params.images;
    var price = req.params.price;
    if(!name || !originLink || !price) {
      return next(new restify.errors.InvalidArgumentError('some params can not be null'));
    }
    var product = new Product({
      name : name,
      cover : cover,
      images : images,
      originLink : originLink,
      buyLink : buyLink || originLink,
      price : price,
    });
    
  },
  updateProduct : function(req, res, next) {

  },
  deleteProduct : function(req, res, next) {

  }
}
module.exports = ProductRoute;
