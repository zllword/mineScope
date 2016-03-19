var config = require('../config');
var restify = require('restify');
var Link = require('./model/Link');

var LinkRoute = {
  getLinks : function(req, res, next) {
    var keyword = req.params.keyword;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;
    Link.find({},function(err,docs){
      console.log(docs);
      res.send(200,{data : docs});
    });
  },
  addLink : function(req, res, next) {
    var title = req.params.title;
    var url = req.params.url;
    var user = req.decoded;
    if(!title || !url) {
      return next(new restify.errors.InvalidArgumentError('title or url can not be null'));
    }
    var link = new Link({
      title : title,
      url : url,
      postDate : new Date(),
      owner : user.id,
    });
    link.save(function(err){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to save link'));
      }
      res.send(200,{success : true});
    });
  },
  updateLink : function(req, res, next) {
    var title = req.params.title;
    var url = req.params.url;
    var id = req.params.linkID;
    var user = req.decoded;
    console.log(user);
    Link.findById(id,function(err,link){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      }
      if(!link) {
        return next(new restify.errors.PreconditionFailedError('no this article'));
      }
      if(link.owner != user.id || user.privilege['updateLink']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update link'));
      }
      link.title = title;
      link.url = url;
      link.updateDate = new Date();
      link.save(function(err){
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to update link'));
        }
        res.send(200,{success : true});
      });
    });
  },
  deleteLink : function(req, res, next) {
    var id = req.params.linkID;
    var user = req.decoded;
    Link.findById(id,function(err,link){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!link)
        return next(new restify.errors.PreconditionFailedError('no this link'));
      link.remove(function(err){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to delete link'));
        res.send(200,{success : true});
      })
    });
  }
}
module.exports = LinkRoute;
