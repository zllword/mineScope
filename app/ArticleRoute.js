var config = require('../config');
var restify = require('restify');
var Article = require('./model/Article');
var Favorite = require('./model/Favorite');

var ArticleRoute = {
  getArticles : function(req, res, next) {
    var keyword = req.params.keyword;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;
    Article.find({},function(err,docs){
      console.log(docs);
      res.send(200,{data : docs});
    });
  },
  addArticle : function(req, res, next) {
    var title = req.params.title;
    var content = req.params.content;
    var type = req.params.type || -1
    var user = req.decoded;
    var cover = req.params.cover || ''
    if(!title || !content) {
      return next(new restify.errors.InvalidArgumentError('title or content can not be null'));
    }
    var article = new Article({
      title : title,
      cover : cover,
      type : type,
      content: content,
      postDate : new Date(),
      owner : user.id,
    });
    article.save(function(err){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to save article'));
      }
      res.send(200,{success : true});
    });
  },
  updateArticle : function(req, res, next) {
    var title = req.params.title;
    var content = req.params.content;
    var id = req.params.articleID;
    var user = req.decoded;
    console.log(user);
    Article.findById(id,function(err,article){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      }
      if(!article) {
        return next(new restify.errors.PreconditionFailedError('no this article'));
      }
      if(article.authorID != user.id || user.privilege['updateArticle']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update article'));
      }
      article.title = title;
      article.content = content;
      article.updateDate = new Date();
      article.save(function(err){
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to update article'));
        }
        res.send(200,{success : true});
      });
    });
  },

  deleteArticle : function(req, res, next) {
    var id = req.params.id;
    var user = req.decoded;
    Article.findById(id,function(err,article){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(article)
        return next(new restify.errors.PreconditionFailedError('no this article'));
      if(article.authorID != user._id || user.privilege['updateArticle']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update article'));
      }
      article.remove(function(err){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to delete article'));
        res.send(200,{success : true});
      })
    });
  },

  likeArticle : function(req, res, next) {
    var id = req.params.articleID;
    var user = req.decoded;
    Article.findById(id,function(err,article){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!article)
        return next(new restify.errors.PreconditionFailedError('no this article'));
      if(article.likeMembers && article.likeMembers.indexOf(user.id) >= 0) {
        return next(new restify.errors.TooManyRequestsError('you have liked it.'));
      }
      Favorite.find({ userID : user.id, articleID: article._id},function(err,docs){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to find by ID'));
        if(docs && docs.length > 0){
          return next(new restify.errors.TooManyRequestsError('you have liked it.'));
        }
        var favorite = new Favorite({
          userID : user.id,
          userName : user.name,
          userAvatar : user.avatar,
          articleID : article.id,
          articleTitle : article.title,
          articleCover : article.cover,
        });
        favorite.save(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to insertFavorite'));
          article.likeMembers.push(user.id);
          article.likeCount = article.likeMembers.length;
          article.save(function(err){
            if(err)
              return next(new restify.errors.InternalServerError('db error when try to like article'));
            res.send(200,{success : true});
          });
        });
      });
    });
  },

  unlikeArticle : function(req, res, next) {
    var id = req.params.articleID;
    var user = req.decoded;
    Article.findById(id,function(err,article){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!article)
        return next(new restify.errors.PreconditionFailedError('no this article'));
      if(article.likeMembers && article.likeMembers.indexOf(user.id) >=0) {
        var newMembers = article.likeMembers.filter(function(item){
            return (item != user.id)
          });
        article.likeMembers = newMembers;
        console.log(article.likeMembers);
        article.likeCount = article.likeMembers.length;
        article.save(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to like article'));
          res.send(200,{success : true});
        });
      }else {
        return next(new restify.errors.PreconditionFailedError('you never like it'));
      }

    });
  }
}

module.exports = ArticleRoute;
