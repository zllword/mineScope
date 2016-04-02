var config = require('../config');
var restify = require('restify');
var Comment = require('./model/Comment');
var Board = require('./model/Board');
var Favorite = require('./model/Favorite');
var _ = require('lodash');
var ObjectId = require('mongoose').Types.ObjectId;

var CommentRoute = {
  getComments : function(req, res, next) {
    var board = req.params.boardID;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;

    if (!board)
      return next(new restify.errors.InvalidArgumentError('postID can not be null'));
    Comment.find({ board: ObjectId(board) })
      .limit(limit)
      .skip(skip)
      .exec(function(err,docs){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to find comment'));
        console.log(docs);
        res.send(200,{data : docs});
      });
  },
  // 添加评论
  addComment : function(req, res, next) {
    var title = req.params.title;
    var content = req.params.content;
    var type = req.params.type;
    var boardID = req.params.boardID;
    var user = req.decoded;
    if(!boardID|| !content) {
      return next(new restify.errors.InvalidArgumentError('type or content,type can not be null'));
    }
    Board.findById(boardID,function(err,board){
      if (err)
        return next(new restify.errors.InternalServerError(err));
      var comment = new Comment({
        title : title,
        type : type,
        board : boardID,
        content : content,
        viewCount : 0,
        postDate : new Date(),
        owner : user.id
      });
      comment.save(function(err){
        console.log(err)
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to save comment'));
        }
        board.comments.unshift(comment._id);
        if(board.comments.length > config.MAX_COMMENT_COUNT)
          board.comments.slice(0,config.MAX_COMMENT_COUNT-1);
        Comment.count({ board: board._id}, function(err, count){
          if(err) return next(new restify.errors.InternalServerError(err));
          board.commentCount = count;
          board.save(function(err){
            if(err) console.log(err);
            res.send(200,{success: true});
          });
        });
      });
      //----end of save ------------
    });
  },

  updateComment : function(req, res, next) {
    var title = req.params.title;
    var content = req.params.content;
    var id = req.params.commentID;

    var user = req.decoded;
    Comment.findById(id,function(err,comment){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      }
      if(!comment) {
        return next(new restify.errors.PreconditionFailedError('no this comment'));
      }
      if(comment.owner.toString() != user.id.toString() && !user.privilege['updateComment']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update article'));
      }
      comment.title = title;
      comment.content = content;
      comment.updateDate = new Date();
      comment.save(function(err){
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to update comment'));
        }

        res.send(200,{success : true});
      });
    });
  },

  deleteComment : function(req, res, next) {
    var id = req.params.commentID;
    var user = req.decoded;
    Comment.findById(id,function(err,comment){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!comment)
        return next(new restify.errors.PreconditionFailedError('no this comment'));
      if(comment.owner.toString() != user.id.toString() || user.privilege['deleteComment']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to delete comment'));
      }
      var boardID = comment.board;
      comment.remove(function(err){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to delete comment'));
        res.send(200,{success : true});
        Board.findById(boardID,function(err,board){
          if(board) {
            Comment.find({ board: board })
              .limit(config.MAX_COMMENT_COUNT)
              .exec(function(err,doc){
                board.comments = doc.map(function(c){ return c._id});
                if(doc.length < config.MAX_COMMENT_COUNT){
                  board.commentCount = doc.length;
                  board.save(function(err){ console.log(err)});
                }else {
                  Comment.count({board : board._id},function(err, count){
                    board.commentCount = count ;
                    board.save(function(err){
                      console.log(err);
                    })
                  });
                }
              });
          }
        });
      })
    });
  },

  likeComment : function(req, res, next) {
    var id = req.params.commentID;
    var user = req.decoded;
    //未做用户是否登录判断，均放到统一的用户权限检查中
    Comment.findById(id,function(err,comment){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!comment)
        return next(new restify.errors.PreconditionFailedError('no this comment'));

      Favorite.findOne({ user : user.id, comment: comment._id},function(err,docs){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to find by ID'));
        if(docs){
          return next(new restify.errors.TooManyRequestsError('you have liked it.'));
        }
        var favorite = new Favorite({
          user : user.id,
          comment : comment._id
        });
        favorite.save(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to insertFavorite'));

          if(!comment.likeMembers) comment.likeMembers = [];
          comment.likeMembers.unshift(user.id);

          if(comment.likeMembers.length > config.MAX_USER_COUNT) {
            comment.likeMembers.slice(0,config.MAX_USER_COUNT - 1);
          }

          Favorite.count({ comment: comment._id }, function(err, count){
            comment.likeCount = count;
            comment.save(function(err){
              if(err)
                return next(new restify.errors.InternalServerError('db error when try to like video'));
              res.send(200,{success : true});
            });
          });

        });
      });
    });
  },

  unlikeComment : function(req, res, next) {
    var id = req.params.commentID;
    var user = req.decoded;
    Comment.findById(id,function(err,comment){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find comment by ID'));
      if(!comment)
        return next(new restify.errors.PreconditionFailedError('no this comment'));
      Favorite.findOne({ user: user.id, comment: comment._id},function(err,doc){
        if (err)
          return next(new restify.errors.InternalServerError('db error when try to unlike comment'));
        if (!doc)
          return next(new restify.errors.PreconditionFailedError('you never like it'));
        doc.remove(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to find comment by ID'));
          res.send(200,{ success : true });
          // 后台需要更新board的相关数据
          Favorite.find({comment : comment._id })
            .limit(config.MAX_USER_COUNT)
            .exec(function(err,doc1){
              if(err)
                console.log(err);
              console.log(doc1);
              if(doc1) {
                members = doc1.map(function (o) { return o.user });
                comment.likeMembers = members;
                if(doc1.length < config.MAX_USER_COUNT){
                  comment.likeCount = doc1.length;
                  comment.save(function(err){
                    console.log(err);
                    // res.send(200,{ success : true });
                  });
                }else {
                  Favorite.count({comment : comment._id},function(err,count){
                    comment.likeCount = count;
                    comment.save(function(err){
                      console.log(err);
                    })
                  });
                }

              }else{
                video.likeMembers = [];
                video.likeCount = 0;
                video.save(function(err){
                  console.log(err);
                  // res.send(200,{ success : true });
                })
              }
            })
        });
      });

    });
  }
}

module.exports = CommentRoute;
