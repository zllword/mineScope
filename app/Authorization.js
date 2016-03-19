var jwt    = require('jsonwebtoken');

module.exports = function (req, res, next) {
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
}
