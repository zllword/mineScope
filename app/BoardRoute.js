var config = require('../config');
var restify = require('restify');
var Board = require('./model/Board');
var Favorite = require('./model/Favorite');

var BoardRoute = {
  getBoards : function(req, res, next) {
    var keyword = req.params.keyword;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;
    Board.find({},function(err,docs){
      console.log(docs);
      res.send(200,{data : docs});
    });
  },
  addBoard : function(req, res, next) {
    var title = req.params.title;
    var description = req.params.description;
    var type = req.params.type || -1
    var user = req.decoded;
    var cover = req.params.cover || ''
    if(!title) {
      return next(new restify.errors.InvalidArgumentError('title or content can not be null'));
    }
    var board = new Board({
      title : title,
      description : description,
      cover : cover,
      type : type,
      postDate : new Date(),
      owner : user.id,
    });
    board.save(function(err){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to save article'));
      }
      res.send(200,{success : true});
    });
  },
  updateBoard : function(req, res, next) {
    var title = req.params.title;
    var description = req.params.description;
    var cover = req.params.cover;
    var id = req.params.boardID;
    var user = req.decoded;
    console.log(user);
    Board.findById(id,function(err,board){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      }
      if(!board) {
        return next(new restify.errors.PreconditionFailedError('no this board'));
      }
      if(board.owner.toString() != user.id.toString() && !user.privilege['updateBoard']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update board'));
      }
      board.title = title;
      board.description = description;
      board.cover = cover;
      board.updateDate = new Date();
      board.save(function(err){
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to update board'));
        }
        res.send(200,{success : true});
      });
    });
  },

  deleteBoard : function(req, res, next) {
    var id = req.params.boardID;
    var user = req.decoded;
    console.log(id)
    Board.findById(id,function(err,board){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!board)
        return next(new restify.errors.PreconditionFailedError('no this board'));
      if(board.owner.toString() != user.id.toString() || user.privilege['updateBoard']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update board'));
      }
      board.remove(function(err){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to delete board'));
        res.send(200,{success : true});
      })
    });
  },

  likeBoard : function(req, res, next) {
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

  unlikeBoard : function(req, res, next) {
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

module.exports = BoardRoute;
