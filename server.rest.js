var restify = require('restify');
var jwt    = require('jsonwebtoken');
var User = require('./app/model/User');
var config = require('./config');
var mongoose = require('mongoose');
var validator = require('validator');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var ObjectId = mongoose.Types.ObjectId;
mongoose.connect(config.database);

var UserRoute = require('./app/UserRoute');
var ArticleRoute = require('./app/ArticleRoute');
var ProductRoute = require('./app/ProductRoute');
var LinkRoute = require('./app/LinkRoute');

var server = restify.createServer({
  name: 'mineScope',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({
    origins: ['http://localhost:3001'],   // defaults to ['*']
    credentials: true,                 // defaults to false
    headers: ['authorization-token']                 // sets expose-headers
}));

server.use(restify.authorizationParser());

server.post('/login', UserRoute.login);
server.post('/register',UserRoute.register);

server.get('/articles',ArticleRoute.getArticles);
server.get('/links',LinkRoute.getLinks);
server.get('/products',ProductRoute.getProducts);
//authorization
server.use(function(req, res, next){
  console.log(req.authorization);
  var token = req.params.token || req.headers.token;
  if(token){
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        res.send(401,{ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        decoded.id = ObjectId(decoded.id);
        req.decoded = decoded;
        next();
      }
    });
  }else{
    res.send(new restify.errors.ForbiddenError('no token'));
  }
});
//------------need auth----------------//
server.get('/users',UserRoute.users);

//articles
server.post('/articles',ArticleRoute.addArticle);
server.put('/articles/:articleID',ArticleRoute.updateArticle);
server.del('/articles/:articleID',ArticleRoute.deleteArticle);
server.put('/articles/:articleID/like',ArticleRoute.likeArticle);
server.put('/articles/:articleID/unlike',ArticleRoute.unlikeArticle);

//product
server.post('/products',ProductRoute.addProduct);
server.put('/products/:productID',ProductRoute.updateProduct);
server.del('products/:productID',ProductRoute.deleteProduct);

//links
server.get('/links',LinkRoute.getLinks);
server.post('/links',LinkRoute.addLink);
server.put('/links/:linkID',LinkRoute.updateLink);
server.del('/links/:linkID',LinkRoute.deleteLink);

server.on('InternalServer', function (req, res, err, cb) {
  err.body = 'something is wrong!';
  throw err;
  return cb();
});

server.listen(8888, function () {
  console.log('%s listening at %s', server.name, server.url);
});
