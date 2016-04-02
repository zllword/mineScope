var config = require('../config');
var restify = require('restify');
var Video = require('./model/Video');
var Favorite = require('./model/Favorite');
var _ = require('lodash');

var VideoRoute = {
  getVideos : function(req, res, next) {
    var keyword = req.params.keyword;
    var limit = req.params.limit || 10;
    var skip = req.params.skip || 0;
    Video.find({},function(err,docs){
      console.log(docs);
      res.send(200,{data : docs});
    });
  },
  addVideo : function(req, res, next) {
    var title = req.params.title;
    var description = req.params.description;
    var type = req.params.type || -1
    var user = req.decoded;
    var poster = req.params.poster || '';
    var storage = req.params.storage;
    if(!title || !description) {
      return next(new restify.errors.InvalidArgumentError('title or description can not be null'));
    }
    var video = new Video({
      title : title,
      poster : poster,
      description : description,
      type : type,
      storage : storage,
      viewCount : 0,
      postDate : new Date(),
      owner : user.id
    });
    video.save(function(err){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to save video'));
      }
      res.send(200,{success : true});
    });
  },
  updateVideo : function(req, res, next) {
    var title = req.params.title;
    var description = req.params.description;
    var poster = req.params.poster;
    var storage = req.params.storage;
    var id = req.params.videoID;

    var user = req.decoded;
    console.log(user);
    Video.findById(id,function(err,video){
      if(err) {
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      }
      if(!video) {
        return next(new restify.errors.PreconditionFailedError('no this article'));
      }
      if(video.owner.toString() != user.id.toString() && !user.privilege['updateVideo']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update article'));
      }
      video.title = title;
      video.description = description;
      video.storage = storage;
      video.poster = poster;
      video.updateDate = new Date();
      video.save(function(err){
        if(err) {
          return next(new restify.errors.InternalServerError('db error when try to update article'));
        }
        res.send(200,{success : true});
      });
    });
  },

  deleteVideo : function(req, res, next) {
    var id = req.params.videoID;
    var user = req.decoded;
    Video.findById(id,function(err,video){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!video)
        return next(new restify.errors.PreconditionFailedError('no this video'));
      if(video.owner.toString() != user.id.toString() || user.privilege['deleteVideo']) {
        return next(new restify.errors.PreconditionFailedError('no previlege to update article'));
      }
      video.remove(function(err){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to delete video'));
        res.send(200,{success : true});
      })
    });
  },

  likeVideo : function(req, res, next) {
    var id = req.params.videoID;
    var user = req.decoded;
    //未做用户是否登录判断，均放到统一的用户权限检查中
    Video.findById(id,function(err,video){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find by ID'));
      if(!video)
        return next(new restify.errors.PreconditionFailedError('no this video'));

      Favorite.findOne({ user : user.id, video: video._id},function(err,docs){
        if(err)
          return next(new restify.errors.InternalServerError('db error when try to find by ID'));
        if(docs){
          return next(new restify.errors.TooManyRequestsError('you have liked it.'));
        }
        var favorite = new Favorite({
          user : user.id,
          video : video._id
        });
        favorite.save(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to insertFavorite'));
          video.likeMembers.unshift(user.id);

          if(video.likeMembers.length > config.MAX_USER_COUNT) {
            video.likeMembers.slice(0,config.MAX_USER_COUNT - 1);
          }
          if (!video.likeCount) {
            video.likeCount = 1;
          }else{
            video.likeCount ++;
          }
          video.save(function(err){
            if(err)
              return next(new restify.errors.InternalServerError('db error when try to like video'));
            res.send(200,{success : true});
          });
        });
      });
    });
  },

  unlikeVideo : function(req, res, next) {
    var id = req.params.videoID;
    var user = req.decoded;
    Video.findById(id,function(err,video){
      if(err)
        return next(new restify.errors.InternalServerError('db error when try to find board by ID'));
      if(!video)
        return next(new restify.errors.PreconditionFailedError('no this board'));
      Favorite.findOne({ user: user.id, video: video._id},function(err,doc){
        if (err)
          return next(new restify.errors.InternalServerError('db error when try to unlike video'));
        if (!doc)
          return next(new restify.errors.PreconditionFailedError('you never like it'));
        doc.remove(function(err){
          if(err)
            return next(new restify.errors.InternalServerError('db error when try to find video by ID'));
          res.send(200,{ success : true });
          // 后台需要更新board的相关数据
          var exist = _.find(video.likeMembers,function(id){ return id.toString() == user.id.toString() });

          if (exist) {
            Favorite.find({video : video._id })
              .limit(config.MAX_USER_COUNT)
              .exec(function(err,doc1){
                if(err)
                  console.log(err);
                console.log(doc1);
                if(doc1) {
                  members = doc1.map(function (o) { return o.user });
                  video.likeMembers = members;
                  if(doc1.length < config.MAX_USER_COUNT){
                    video.likeCount = doc1.length;
                  }else {
                    if (video.likeCount > 0) {
                        video.likeCount --;
                    }else{
                      video.likeCount = 0;
                    }
                  }
                  video.save(function(err){
                    console.log(err);
                    // res.send(200,{ success : true });
                  });
                }else{
                  video.likeMembers = [];
                  video.likeCount = 0;
                  video.save(function(err){
                    console.log(err);
                    // res.send(200,{ success : true });
                  })
                }
              })
          }else{
            if (video.likeCount > 0) {
                video.likeCount --;
            }else{
              video.likeCount = 0;
            }
            video.save(function(err){
              console.log(err);
              // res.send(200,{ success : true });
            })
          }
        });
      });

    });
  }
}

module.exports = VideoRoute;
