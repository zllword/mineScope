// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var config = require('./config');
var mongoose = require('mongoose');
var User = require('./app/model/User');

var validator = require('validator');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(config.database);

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/users')
  .get(function (req, res) {
    res.json({ message : 'get users' });
  })
  .post(function(req, res){
    md5.update(req.body.password)
    var user = new User({
      email : req.body.email,
      password : md5.digest('hex')
    });
    user.save(function(err){
      if(err) {
        console.log(err)
        res.send(err);
        return next();
      }
      console.log('create user success!');
      res.send(201,{
        success:true,
      })
    });
    console.log(req.body);
    res.json({ message : 'post users:' + req.body.name });
  });
router.route('/user/:userID')
  .get(function (req, res) {
    if(!req.params.userID) res.json({ error: 'error'})
    res.json({ message : 'get user:'+req.params.userID });
  });

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);