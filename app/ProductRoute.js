var config = require('../config');
var restify = require('restify');
var Product = require('./model/Product');
var graper = require('./graper');
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
  grapProductFromLink : function(req, res, next) {
    var url = req.params.url;
    graper.getTaobao(url)
      .then(function (product){
        res.send(200,{data : product})
      })
      .catch(function(err){
        return next(new restify.errors.InvalidArgumentError(err));
      });
  },
  addProduct : function(req, res, next) {
    console.log(req.params)
    var name = req.params.title;
    var originLink = req.params.url;
    var cover = req.params.cover;
    var images = req.params.images;
    var price = req.params.price;
    var user = req.decoded;
    if(!name || !originLink) {
      return next(new restify.errors.InvalidArgumentError('some params can not be null'));
    }
    var product = new Product({
      name : name,
      cover : cover,
      images : images,
      originLink : originLink,
      price : price,
      owner : user.id,
      postDate : new Date()
    });
    product.save(function(err){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to save link'));
      }
      res.send(200,{success : true});
    });
  },
  updateProduct : function(req, res, next) {
    var title = req.params.title;
    var url = req.params.url;
    var id = req.params.productID;
    var user = req.decoded;
    Product.findById(id,function(err,product){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      }
      if(!product) {
        return next(new restify.errors.PreconditionFailedError('no this article'));
      }
      if(product.owner.toString() != user.id.toString() && !user.privilege['updateLink']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update link'));
      }
      product.title = title;
      product.url = url;
      product.updateDate = new Date();
      product.save(function(err){
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to update link'));
        }
        res.send(200,{success : true});
      });
    });
  },
  deleteProduct : function(req, res, next) {
    var id = req.params.productID;
    var user = req.decoded;
    Product.findById(id,function(err,product){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!product)
        return next(new restify.errors.PreconditionFailedError('no this link'));
      if(product.owner.toString() != user.id.toString() && !user.privilege['updateLink']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to delete link'));
      }
      product.remove(function(err){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to delete link'));
        res.send(200,{success : true});
      })
    });
  }
}
module.exports = ProductRoute;
