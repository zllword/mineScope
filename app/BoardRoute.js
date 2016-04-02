var _ = require('lodash');
var config = require('../config');
var restify = require('restify');
var Board = require('./model/Board');
var Video = require('./model/Video');
var Article = require('./model/Article');
var Favorite = require('./model/Favorite');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var BoardRoute = {
  // 获取相信的 board
  getBoardDetail : function (req, res, next) {
    var id = req.params.boardID;
    if (!id) {
      return next(new restify.errors.InvalidArgumentError('id can not be null'))
    }
    Board.findById(id)
      .populate('articles')
      .exec(function(error, board){
        if(error) {
          return next(new restify.errors.InternalServerError('db error when try to find by ID'));
        }
        if(!board) {
          return next(new restify.errors.PreconditionFailedError('no this board'));
        }
        res.send(200,board);
      });
  },
  // 向看板增加对象
  /*
  * 参数说明
  * boardID ： 看板ID
  * type ： a => 文章 ; v => 视频 ; p => 产品
  */
  addToBoard : function (req, res, next) {
      var id = req.params.boardID;
      var type = req.params.type;
      var objID = req.params.oid;
      var user = req.decoded;

      if (!id || !type || !objID) {
        return next(new restify.errors.InvalidArgumentError('params can not be null'))
      }
      if (!user) {
        return next(new restify.errors.PreconditionFailedError('need login'));
      }
      Board.findById(id,function(error,board){
        if(error) {
          return next(new restify.errors.InternalServerError('db error when try to find board by ID:'+id));
        }
        if(!board) {
          return next(new restify.errors.PreconditionFailedError('no this board'));
        }
        // 检查是否已经超过最大的限制
        if(board.contentCount() >= config.MAX_OBJ_COUNT ) {
          return next(new restify.errors.PreconditionFailedError('one board only can hold ' + config.MAX_OBJ_COUNT +' content'));
        }
        if(type == 'v') {
          // video
          Video.findById(objID,function(err, video){
            if(err) {
              return next(new restify.errors.InternalServerError('db error when try to find video by ID:'+objID));
            }
            if(!video) {
              return next(new restify.errors.PreconditionFailedError('no this video'));
            }
            //判断是否存在
            var exsit = _.find(board.articles,function(a){
              return a.toString() == article._id.toString();
            });
            if (exsit) {
              res.send(202,{success:false,message:'aleady in the board'});
            }else {
              board.videos.push(video._id);
              board.save(function(err){
                if(err) {
                  return next(new restify.errors.InternalServerError('db error when try to save board'));
                }
                res.send(200,{success:true});
              });
            }
          });
        }
        if(type == 'a') {
          // article
          // 增加文章到我的画板上
          Article.findById(objID,function(err, article){
            if(err) {
              return next(new restify.errors.InternalServerError('db error when try to find article by ID:'+objID));
            }
            if(!article) {
              return next(new restify.errors.PreconditionFailedError('no this article'));
            }
            var exsit = _.find(board.articles,function(a){
              return a.toString() == article._id.toString();
            });
            if (exsit) {
              res.send(202,{success:false,message:'aleady in the board'});
            }else {
              board.articles.push(article._id);
              board.save(function(err){
                if(err) {
                  return next(new restify.errors.InternalServerError('db error when try to save board'));
                }
                res.send(200,{success:true});
              });
            }
          });
        }
        if(type == 'p') {
          // product

        }
      });

  },
  // 查询看板
  getBoards : function(req, res, next) {
    var keyword = req.params.keyword;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;
    Board.find({},function(err,docs){
      console.log(docs);
      res.send(200,{data : docs});
    });
  },
  // 创建看板
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
  //更新看板
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
  //删除看板
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
  //收藏看板
  likeBoard : function(req, res, next) {
    var id = req.params.boardID;
    var user = req.decoded;
    //未做用户是否登录判断，均放到统一的用户权限检查中
    Board.findById(id,function(err,board){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!board)
        return next(new restify.errors.PreconditionFailedError('no this article'));

      Favorite.findOne({ user : user.id, board: board._id},function(err,docs){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to find by ID'));
        if(docs){
          return next(new restify.errors.TooManyRequestsError('you have liked it.'));
        }
        var favorite = new Favorite({
          user : user.id,
          board : board._id
        });
        favorite.save(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to insertFavorite'));
          board.likeMembers.unshift(user.id);

          if(board.likeMembers.length > config.MAX_USER_COUNT) {
            board.likeMembers.slice(0,config.MAX_USER_COUNT - 1);
          }
          if (!board.likeCount) {
            board.likeCount = 1;
          }else{
            board.likeCount ++;
          }
          board.save(function(err){
            if(err)
              return next(new restify.errors.InternalServerError('db error when try to like board'));
            res.send(200,{success : true});
          });
        });
      });
    });
  },
  // 取消收藏
  // boardID ： 看板ID
  unlikeBoard : function(req, res, next) {
    var id = req.params.boardID;
    var user = req.decoded;
    Board.findById(id,function(err,board){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find board by ID'));
      if(!board)
        return next(new restify.errors.PreconditionFailedError('no this board'));
      Favorite.findOne({ user: user.id, board: board._id},function(err,doc){
        if (err)
          return next(new restify.errors.InternalServerError('db error when try to unlike article'));
        if (!doc)
          return next(new restify.errors.PreconditionFailedError('you never like it'));
        doc.remove(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to find board by ID'));
          res.send(200,{ success : true });
          // 后台需要更新board的相关数据
          var exist = _.find(board.likeMembers,function(id){ return id.toString() == user.id.toString() });

          if (exist) {
            Favorite.find({board : board._id })
              .limit(config.MAX_USER_COUNT)
              .exec(function(err,doc1){
                if(err)
                  console.log(err);
                console.log(doc1);
                if(doc1) {
                  members = doc1.map(function (o) { return ObjectId(o.user) });
                  board.likeMembers = members;
                  if(doc1.length < config.MAX_USER_COUNT){
                    board.likeCount = doc1.length;
                  }else {
                    if (board.likeCount > 0) {
                        board.likeCount --;
                    }else{
                      board.likeCount = 0;
                    }
                  }
                  board.save(function(err){
                    console.log(err);
                    // res.send(200,{ success : true });
                  });
                }else{
                  board.likeMembers = [];
                  board.likeCount = 0;
                  board.save(function(err){
                    console.log(err);
                    // res.send(200,{ success : true });
                  })
                }
              })
          }else{
            if (board.likeCount > 0) {
                board.likeCount --;
            }else{
              board.likeCount = 0;
            }
            board.save(function(err){
              console.log(err);
              // res.send(200,{ success : true });
            })
          }
        });
      });

    });
  }
}

module.exports = BoardRoute;
