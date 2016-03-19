var User = require('./model/waterline/User');
var config = require('../config');
var restify = require('restify');
var validator = require('validator');
var crypto = require('crypto');
var jwt    = require('jsonwebtoken');

var UserRoute = {
  register : function (req, res, next) {
    console.log(req.params)
    if (!req.params.email || !req.params.password) {
      var error = new restify.InvalidArgumentError('email or password can not be null')
      return next(error)
    }
    if (!validator.isEmail(req.params.email)) {
      return next( new restify.InvalidArgumentError('error email address'))
    }
    var md5 = crypto.createHash('md5');
    md5.update(req.params.password);
    user.create({
      email : req.params.email,
      password : md5.digest('hex')
    }).exec(function(err,user){
      if(err) {
        console.log(err)
        return next(new restify.errors.InternalServerError('error in database'));
      }
      console.log('create user success!');
      res.send(201,{
        success:true,
      })
    });

  },

  login : function ( req, res, next) {
    console.log(req.params)
    var email = req.params.email;
    var password = req.params.password;
    if (!email || !password){
      var error = new restify.InvalidArgumentError('email or password can not be null')
      return next(error)
    }
    if (!validator.isEmail(email)) {
      return next( new restify.InvalidArgumentError('error email address'))
    }
    User.findOne({
      email : email
    },function(err,user){
      if(err) {
        var error = new restify.errors.InternalServerError('error in database');
        return next(error)
      }
      if(!user) {
        return next(new restify.errors.UnauthorizedError('user not exist'));
      }
      var md5 = crypto.createHash('md5');
      md5.update(password);
      if(user.password === md5.digest('hex')) {
        var userData = {
          email : user.email,
          id : user._id,
          privilege : [],
        }
        var token = jwt.sign(userData, config.secret, {
          expiresIn: 1440*60 // expires in 24 hours
        });
        res.send(200,{
          success : true,
          token : token
        });
      }else {
        return next(new restify.errors.UnauthorizedError('wrong password'));
      }
    });
  },

  logout : function (req, res, next) {

  },
  users : function (req, res, next) {
    console.log(req.decoded);
    if(!req.decoded) return next(new restify.errors.UnauthorizedError('need token decode'));
    User.find({},function(err,users){
      if(err) {
        var error = new restify.errors.InternalServerError('error in database');
        return next(error)
      }
      res.send(200,{
        users : users
      });
    })
  }
}

module.exports = UserRoute;
